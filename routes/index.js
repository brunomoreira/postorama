var express = require('express');
var router = express.Router();
var form = require('express-form');
var field = form.field;
var postModel = require('../models/post.js');
var userModel = require('../models/user.js');
var replyModel = require('../models/reply.js');
var moment = require('moment');
var reqIp = require('request-ip');
var Cryptr = require('cryptr');
var cryptr = new Cryptr('hdasjd1904721ndais,;mdo,3m23m');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {

	var loggedAdmin = null;

	if(req.signedCookies.adminsession) {

		var loggedAdmin = cryptr.decrypt(req.signedCookies.adminsession);

	}

	if(!req.signedCookies.appsession) {

		/* Star new Session */
		res.cookie('appsession', cryptr.encrypt(reqIp.getClientIp(req)), { signed: true });

		/* Check if posts exists */
		postModel.find({}).populate('author').exec(function(err, posts) {
			

			if(err) {

				res.render('index', { 
					title: 'Express', 
					csrfToken: req.csrfToken(),
					loggedAdmin: loggedAdmin 
				});

			}
			else {
				
				userModel.find({}, function(err, users) {

					res.render('index', { 
						title: 'Express',
						csrfToken: req.csrfToken(),
						posts: posts,
						users: users,
						moment: moment,
						loggedAdmin: loggedAdmin
					});

				});

			}

		});

	}
	else {

		/* Get IP from session */
		var clientIp = cryptr.decrypt(req.signedCookies.appsession);

		/* Check if posts exists */
		postModel.find({}).populate('author').exec(function(err, posts) {

			if(err) {

				res.render('index', { 
					title: 'Express', 
					csrfToken: req.csrfToken(),
					loggedAdmin: loggedAdmin 
				});

			}
			else {
				
				userModel.find({}, function(err, users) {

					res.render('index', { 
						title: 'Express',
						csrfToken: req.csrfToken(),
						posts: posts,
						users: users,
						moment: moment,
						loggedAdmin: loggedAdmin
					});

				});

			}

		});

	}	

});

/* POST - New Post Form */
router.post('/new',

	form
	(
		field('email').trim().required().isEmail(),
		field('title').trim().required(),
		field('message').trim().required()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(req.form.isValid) {

				/* Get Client IP */
				var clientIp = cryptr.decrypt(req.signedCookies.appsession);

				/* Check if user already exists */
				userModel.findOne({ email: req.form.email }, function(err, user) {

					if(err) { res.send({ errors: err }); }

					else if(!user) {

						/* If there is no user - persist it */
						var user = new userModel({
							email: req.form.email,
							created: Date.now(),
							ipAddress: clientIp
						});

						user.save(function(err, success) {

							if(err) { res.send({ errors: err }); }

							else if(!success) { res.send({ errors: ['Something went wrong! Try again later.'] }); }

							else {

								/* If the user was persisted - persist the post */
								var post = new postModel({
									title: req.form.title,
									content: req.form.message,
									author: user._id,
									created: Date.now(),
									replyTo: null
								});

								post.save(function(err, post) {

									if(err) { res.send({ errors: err }); }

									else if(!post) { res.send({ errors: ['Something went wrong! Try again later.'] }); }	

									else {

										res.send('Post Saved! Thank you for being awesome!');

									}

								});

							}

						});

					}
					else {

						/* If the user already exists persist the post */
						var post = new postModel({
							title: req.form.title,
							content: req.form.message,
							author: user._id,
							created: Date.now(),
							replyTo: null
						});

						post.save(function(err, post) {

							if(err) { res.send({ errors: err }); }

							else if(!post) { res.send({ errors: ['Something went wrong! Try again later.'] }); }	

							else {

								res.send('Post Saved! Thank you for being awesome!');

							}

						});

					}

				});

			}
			else {

				res.send({
					errors: req.form.errors
				});

			}

		}
		else {

			res.redirect('/');

		}

});

/* POST - New Reply Form */
router.post('/reply', 

	form
	(
		field('email').trim().required().isEmail(),
		field('content').trim().required(),
		field('postId').required().notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(req.form.isValid) {

				/* Get Client IP */
				var clientIp = cryptr.decrypt(req.signedCookies.appsession);

				/* Get the post by ID */
				postModel.findOne({ _id: req.form.postId }, function(err, post) {

					if(err) {

						res.send({ errors: err });

					}
					else if(!post) {

						res.redirect('/');

					}
					else {

						/* If post was found - Search if user exists */
						userModel.findOne({ email: req.form.email }, 'email', function(err, user) {

							if(err) { res.send({ errors: err }); }

							else if(!user) {

								var user = new userModel({
									email: req.form.email,
									created: Date.now(),
									ipAddress: clientIp
								});

								user.save(function(err, success) {

									if(err) { res.send({ errors: err }); }

									else if(!success) { res.send({ errors: ['Something went wrong! Try again later!'] }); }

									else {

										/* If user was created - insert reply */
										var reply = new replyModel({
											user: req.form.email,
											content: req.form.content,
											created: Date.now()
										});

										/* If reply was created - update post */
										reply.save(function(err, success) {

											if(err) { res.send({ errors: err }); }

											else if(!success) { res.send({ errors: ['Something went wrong! Try again later!'] }); }

											else {

												postModel.findOne({ _id: req.form.postId }, function(err, post) {

													post.update({
														"$push": { replies: reply._id }
													}, function(err, success) {

														if(err) { res.send({ errors: err }); }

														else if(!success) { res.send({ errors: ['Something went wrong! Try again later!'] }); }

														else {

															res.send({
																success: true,
																message: 'Reply Added!'
															});

														}

													});

												});

											}

										});

									}

								});

							}
							else {

								/* Insert new reply */
								var reply = new replyModel({
									user: req.form.email,
									content: req.form.content,
									created: Date.now()
								});

								reply.save(function(err, success) {

									if(err) { res.send({ errors: err }); }

									else if(!success) { res.send({ errors: ['Something went wrong! Try again later!'] }); }

									else {

										/* If reply was saved - update post */
										postModel.findOne({ _id: req.form.postId }, function(err, post) {

											if(err) { res.send({ errors: err }); }

											else if(!post) { res.send({ errors: ['The post does not exist anymore! Sorry :('] }); }

											else {

												post.update({
													"$push": { replies: reply._id }
												}, function(err, success) {

													if(err) { res.send({ errors: err }); }

													else if(!post) { res.send({ errors: ['Something went wrong! Try again later!'] }); }

													else {

														res.send({
															success: true,
															message: 'Reply Added!'
														});

													}
												
												});

											}

										});

									}

								});

							}

						});

					}

				});

			}
			else {

				res.send({
					errors: req.form.errors
				});

			}

		}
		else {

			res.redirect('/');

		}

});

/* GET - Get all replies for a given post */
router.post('/all-comments', 

	form
	(
		field('postId').required().notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(req.form.isValid) {

				/* Find the post by id */
				postModel.findOne({ _id: req.form.postId })
						 .populate('author')
						 .populate('replies')
						 .exec(function(err, post) {

						 	if(err) { res.send({ errors: err }); }

						 	else if(!post) { res.send({ errors: 404 }); }

						 	else {

						 		res.send({ success: true, post: post });

						 	}

						 });

			}
			else {

				res.send({ errors: 403 });

			}

		}
		else {

			res.redirect('/');

		}

});

/* POST - Like Post Form */
router.post('/like', 

	form
	(
		field('postId').required().notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(req.form.isValid) {

				var clientIp = cryptr.decrypt(req.signedCookies.appsession);

				/* Find the post */
				postModel.findOne({ _id: req.form.postId })
						 .populate('author')
						 .exec(function(err, post) {

						 	if(err) { res.send({ errors: err }); }

						 	else if(!post) { res.send({ errors: 404 }); }

						 	else {

						 		/* Check if user is the owner of the post */
						 		var userIp = post.author.ipAddress;

						 		if(userIp === clientIp) {

						 			res.send({ errors: 403, message: "You can't like your own post no matter how awesome it is!" });

						 		}
								else if(post.likes.length != 0) {

									/* Check if the current IP already liked the post */
									if(post.likes.indexOf(clientIp) >= 0) {

										res.send({ errors: 403, message: 'You already liked this post!' });

									}

								}
						 		else {

						 			/* Update likes field */
						 			post.update({
						 				'$push' : { 'likes': clientIp }
						 			}, function(err, success) {

						 				if(err) { res.send({ errors: err }); }

						 				else if(!success) { res.send({ errors: 500 }); }

						 				else {

						 					res.send({
						 						success: true,
						 						message : 'You liked this post like a pro!'
						 					});

						 				}

						 			});

						 		}

						 	}

						 });

			}
			else {

				res.send({ errors: 403 });

			}

		}
		else {

			res.redirect('/');

		}

});

/* POST - Admin Proposal Form */
router.post('/admin-proposal', 

	form
	(
		field('email').required().trim().isEmail(),
		field('message').required().trim(),
		field('terms').required().equals('on')
	), 

	function(req, res, next) {

		if(req.xhr){

			if(!req.form.isValid) { res.send({ errors: req.form.errors }); }

			else { 

				/* Check if user exists and has at least 5 posts */
				postModel.find({}).populate('author').exec(function(err, posts) {

					if(err) res.send({ errors: err });

					else if(!posts) { res.send({ errors: ["You must have at least 5 posts on Post'O'Rama!"] }); }

					else {

						var postsNumber = [];

						for(var i = 0; i < posts.length; i++) {

							if(posts[i].author.email === req.form.email) {

								postsNumber.push(posts[i].author.email);

							}

						}

						if(postsNumber.length < 5) {

							res.send({ errors: ["You must have at least 5 posts on Post'O'Rama!"] });

						}
						else {

							/* Check if User is not already an admin or applied to be an admin */
							userModel.findOne({ email: req.form.email }, function(err, user) {

								if(err) { res.send({ errors: err }); }

								else if(!user) { res.send({ errors: 403 }); }

								else {

									if(user.admin === true) {

										res.send({ errors: ["You are already an Admin!"] });

									}
									else if(user.applied === true) {

										/* Check if user as already applied */
										res.send({ errors: ["You already applied for an admin position! We will contact you as soon as possible."] })

									}
									else {

										/* Update User Applied Field */
										user.update({ applied: true }, function(err, success) {

											if(err) res.send({ errors: err });

											else if(!success) res.send({ errors: ['Something went wrong! Try again later.'] });

											else {

												/* Create the Email */
												var mailOptions = {
													from: "Post'O'Rama - Do not reply!",
													to: req.form.email,
													subject: "Admin Application - Post'O'Rama",
													text: "Hello " + req.form.email + "! We will analyze your application and contact you as soon as possible. Best regards from the Post'O'Rama team!",
													html: "Hello <b>" + req.form.email + "</b>!<br><br>We will analyze your application and contact you as soon as possible.<br><br>Best regards,<br><br>The Post'O'Rama Team.<br><br><b style='color: red;'>Do Not Reply To This Email!</b>"
												};

												/* Try to send the Email To The User */
												transporter.sendMail(mailOptions, function(err, sent) {

													if(err) res.send({ errors: err });

													else if(!sent) res.send({ errors: ['Something went wrong! Try again later.'] });

													else {

														/* Send Email notifying the Admin */
														adminMailOptions = {
															from: req.form.email,
															to: '',
															subject: "Admin Application",
															text: req.form.message,
															html: "The user - " + req.form.email + " as applied for admin. The message he/she wrote was: <br><br>" + req.form.message + "<br><br>See all Applications @ http://localhost:3000/admin/<br><br><b>" + moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + "</b>"
														};

														transporter.sendMail(adminMailOptions, function(err, sent) {

															if(err) res.send({ errors: err });

															else if(!sent) res.send({ errors: ['Something went wrong! Try again later.'] });

															else {

																res.send({ message: 'Application Received! Check your email for further information.' });

															}

														});

													}

												});
												
											}

										});

									}

								}

							});					

						}

					}

				});
				

			}

		}
		else {

			res.redirect('/');

		}	

});

/* POST - Delete Post Form */
router.post('/delete-post', 

	form
	(
		field('postId').notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(req.signedCookies.adminsession) {

				if(req.form.isValid) {
				
					/* Check if post exists */
					postModel.findOne({ _id: req.form.postId }, function(err, post) {

						if(err) { res.send(err); }

						else if(!post) { res.send({ errors: ['Post does not exist anymore!'] }); }

						else {

							if(post.replies.length > 0) {
								
								/* Delete all the replies first */
								for(var i = 0; i < post.replies.length; i++) {

									replyModel.findOne({ _id: post.replies[i] }, function(err, reply) {

										reply.remove({}, function(err, success) {

											return;

										});

									});

								}

								post.remove({}, function(err, success) {

									if(err) { res.send(err); }

									else if(!success) { res.send({ errors: ['Something went wrong! Please try again later.'] }); }

									else {

										res.send({ message: 'Post Deleted Successfully!' });

									}

								});
							
							}
							else {

								post.remove({}, function(err, success) {

									if(err) { res.send(err); }

									else if(!success) { res.send({ errors: ['Something went wrong! Please try again later.'] }); }

									else {

										res.send({ message: 'Post Deleted Successfully!' });

									}

								});

							}	

						}

					});

				}
				else {

					res.send({ errors: req.form.errors });

				}	

			}
			else {

				res.redirect('/');

			}

		}
		else {

			res.redirect('/');

		}


});

module.exports = router;