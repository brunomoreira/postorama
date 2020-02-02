var express = require('express');
var router = express.Router();
var Cryptr = require('cryptr');
var cryptr = new Cryptr('hdasjd1904721ndais,;mdo,3m23m');
var userModel = require('../models/user.js');
var form = require('express-form');
var field = form.field;
var bcrypt = require('bcrypt');
var rs = require('random-string');
var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
});

/* GET - Admin */
router.get('/', function(req, res, next) {

	if(!req.signedCookies.adminsession){

		res.render('admin-application', {
			title: 'Express',
			csrfToken: req.csrfToken()
		});
	
	}
	else {

		/* Get User From Session */
		var userEmail = cryptr.decrypt(req.signedCookies.adminsession);

		/* Find The User */
		userModel.findOne({ email: userEmail }, function(err, user) {

			if(err){
				
				res.clearCookie(req.signedCookies.adminsession);

				res.redirect('/'); 

			}
			else if(!user) {

				res.clearCookie(req.signedCookies.adminsession);

				res.redirect('/');

			}
			else {

				/* If user is found - check if he is an admin */
				if(!user.admin === true) {

					res.clearCookie(req.signedCookies.adminsession);

					res.redirect('/');

				}
				else {

					res.render('admin-application', {
						title: 'Express',
						user: user,
						csrfToken: req.csrfToken()
					});

				}

			}

		});

	}

});

/* POST - Admin Applications */
router.post('/applications', function(req, res, next) {

	if(req.xhr) {

		/* Certify admin is logged in */
		if(req.signedCookies.adminsession) {

			/* Get all the users who have applied */
			userModel.find({ applied: true, admin: false }, function(err, users) {

				if(err) res.send({ errors: err });

				else if(!users) res.send({ errors: ['Something went wrong! Please try again later.'] });

				else {

					res.send(users);

				}

			});

		}
		else {

			res.redirect('/');
		
		}

	}
	else {

		res.redirect('/');

	}

});

/* POST - Admin Login Form */
router.post('/login', 

	form
	(
		field('email').trim().required().isEmail(),
		field('password').trim().required()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(!req.form.isValid) {

				res.send({ errors: req.form.errors });

			}
			else {

				/* Check if user exists */
				userModel.findOne({ email: req.form.email }, function(err, user) {

					if(err) res.send({ errors: err });

					else if(!user) res.send({ errors: ['You are NOT an admin!'] });

					else {

						/* Check if user is an admin */
						if(user.admin === false) {

							res.send({ errors: ['You are NOT an admin!'] });

						}
						else {

							/* If user is an admin - check password */
							bcrypt.compare(req.form.password, user.password, function(err, same) {

								if(err) res.send({ errors: err });

								else if(!same) res.send({ errors: ['Credentials Failed! Try again!'] });

								else {

									/* If everything is OK - Login User! */
									res.cookie('adminsession', cryptr.encrypt(user.email), { signed: true });

									res.send({ success: true });

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

/* POST - Admin Sign-out */
router.post('/sign-out', 

	form
	(
		field('email').required().isEmail()
	), 

	function(req, res, next) {

	if(req.xhr) {

		if(req.form.isValid) {

			/* Check if user is logged in */
			if(req.signedCookies.adminsession) {

				var userEmail = cryptr.decrypt(req.signedCookies.adminsession);

				if(req.form.email === userEmail) {

					res.clearCookie('adminsession');

					res.send({ success: true });

				}
				else {

					res.clearCookie('adminsession');

					res.send({ errors: 403 });

				}

			}
			else {

				res.send({ errors: 403 });

			}

		}
		else {

			res.send({ errors: 403 });

		}

	}
	else {

		res.redirect('/');

	}

});

/* POST - Admin Application Approve */
router.post('/application/approve', function(req, res, next) {

	/* Check if user exists and it has applied for admin */
	userModel.findOne({ _id: req.body.userId }, function(err, user) {

		if(err) { res.send(err); }

		else if(!user) { res.send({ error: 'User does not exist!' }); }

		else {

			/* Create a random password */
			var randomString = rs({ length: 10 });

			/* Update user */
			bcrypt.hash(randomString, 8, function(err, hash) {

				if(err) { res.send(err); }

				else if(!hash) { res.send({ error: 'Something went wrong! Try again later!' }); }	 

				else {

					user.update({
						password: hash,
						admin: true
					}, function(err, success) {

						if(err) { res.send(err); }

						else if(!success) { res.send({ error: 'Could not update user! Try again later!' }); }

						else {

							/* Send the email to the user */
							var mailOptions = {
								from: "Post'O'Rama - Do Not Reply!",
								to: user.email,
								subject: "Admin Application - Post'O'Rama",
								text: "Hello " + user.email + "! Your application for the admin position has been accepted! Here's your password (You should change this!): " + randomString + "",
								html: "Hello <b>" + user.email + "</b>!<br><br>Your application for the admin position has been accepted!<br><br>Here's your password (You should change this!): " + randomString + "<br><br>You can login @ http://localhost:3000/admin<br><br><b style='color: red;'>Do Not Reply To This Email!</b>"
							};

							/* Try to send the Email To The User */
							transporter.sendMail(mailOptions, function(err, sent) {

								if(err) res.send(err);

								else if(!sent) res.send({ error: 'Something went wrong! Try again later.' });

								else {

									res.send({ message: 'User has been Adminamized!' })

								}

							});

						}

					});

				}

			});

		}

	});

});

/* POST - Admin Application Reject */
router.post('/application/reject', function(req, res, next) {

	/* Check if user exists and has applied */
	userModel.findOne({ _id: req.body.userId }, function(err, user) {

		if(err) { res.send(err); }

		else if(!user) { res.send({ error: 'User does not exist!' }); }

		else {

			/* Update User */
			user.update({
				applied: false
			}, function(err, success) {

				if(err) { res.send(err); }

				else if(!success) { res.send({ error: 'Operation could not be completed! Try again later' }); }

				else {
					
					/* Send the email to the user */
					var mailOptions = {
						from: "Post'O'Rama - Do Not Reply!",
						to: user.email,
						subject: "Admin Application - Post'O'Rama",
						text: "Hello " + user.email + "! Unfortunetely, your application for the admin position has been rejected because we are temporarily closed for new admin applicants. You can always apply for a vacant position in the future!",
						html: "Hello <b>" + user.email + "</b>!<br><br>Unfortunetely, your application for the admin position has been rejected because we are temporarily closed for new admin applicants.<br><br>You can always apply for one vacant position in the future!<br><br><b style='color: red;'>Do Not Reply To This Email!</b>"
					};

					/* Try to send the Email To The User */
					transporter.sendMail(mailOptions, function(err, sent) {

						if(err) res.send(err);

						else if(!sent) res.send({ error: 'Something went wrong! Try again later.' });

						else {

							res.send({ message: 'Application Rejected Successfully!' });

						}

					});
					

				}

			});

		}

	});

});

/* POST - Admin Edit */
router.post('/edit', 

	form
	(
		field('old_password').trim().required(),
		field('new_password').trim().required(),
		field('new_re_password').trim().required().equals('field::new_password'),
		field('userId').notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(!req.form.isValid) {

				res.send({ errors: req.form.errors });

			}
			else {

				/* Check if user exists */
				userModel.findOne({ _id: req.form.userId }, function(err, user) {

					if(err) { res.send(err); }

					else if(!user) { 

						res.clearCookie('adminsession'); 

						res.send({ error: 500 }); }

					else {

						/* Check old password */
						bcrypt.compare(req.form.old_password, user.password, function(err, same) {

							if(err) { res.send(err); }

							else if(!same) { res.send({ errors: ['The old password is wrong. Try again.'] }); }

							else {

								/* If the old password is correct - update user */
								bcrypt.hash(req.form.new_password, 8, function(err, hash) {
								
									if(err) { res.send(err); }

									else if(!hash) { res.send({ errors: ['Something went wrong! Try again later.'] }); }

									else {

										user.update({
											password: hash
										}, function(err, success) {

											if(err) { res.send(err); }

											else if(!success) { res.send({ errors: ['Something went wrong! Try again later.'] }); }

											else {

												res.send({ message: 'Password Updated Successfully!' });

											}

										});

									}

								});	

							}

						});

					}

				});

			}

		}
		else {

			res.redirect('/');

		}

});

/* POST - Admin Delete */
router.post('/delete', 

	form
	(
		field('userId').notEmpty()
	), 

	function(req, res, next) {

		if(req.xhr) {

			if(!req.form.isValid) {

				res.send({ errors: req.form.errors });

			}
			else {

				/* Check if user exists */
				userModel.findOne({ _id: req.form.userId }, function(err, user) {

					if(err) { res.send(err); }

					else if(!user) { 

						res.clearCookie('adminsession');

						res.send({ error: 500 }); }

					else {

						/* Check if user is an admin */
						if(user.admin === true) {

							// /* Update user */
							user.update({
								admin: false,
								password: null,
								applied: false
							}, function(err, success) {

								if(err) { res.send(err); }

								else if(!success) { res.send({ errors: ['Something went wrong! Try again later.'] }); }

								else {

									res.clearCookie('adminsession');

									res.send({ message: "You are no longer an Post'O'Rama Admin!", code: 200});

								}
							});							

						}
						else {

							res.clearCookie('adminsession');

							res.send({ error: 500 });

						}

					}

				});

			}

		}
		else {

			res.redirect('/');

		}

});

module.exports = router;