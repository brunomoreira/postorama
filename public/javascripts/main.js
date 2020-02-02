$(document).ready(function() {

	/* Login Form Dynamic Margin Bottom */
	$(".login-form-ctn").css({
		"margin-bottom": $(window).innerHeight() - 405 + "px"
	});

	/* Close Rules */
	$(".close-rules").click(function() {

		$('.rules-text').slideUp('fast');

	});

	/* Open Rules */
	$(".open-rules").click(function() {

		$('.rules-text').slideDown('fast');

	});

	/* Start Bulletin Plugin */
	$('#bulletin').bulletin({
	    interval: 3000,
	    speed: 1000,
	    direction: 'up' // up or down
	});

	/* All Comments Ctn */
	$(".all-comments-ctn").css({
		"height": $(window).innerHeight()
	});

	/* Admin Btn - Admin Modal */
	$('.admin-btn').click(function() {

		$(".admin-proposal-modal").modal();

	});

	/* Admin Login Modal */
	$(".admin-login-btn").click(function() {
		
		$('.admin-modal').modal();

	});

	/* Terms Btn - Terms Modal */
	$(".terms-btn").click(function() {

		$('.terms').modal();

	});

	/* Admin Edit Modal */
	$(".admin-edit-btn").click(function() {

		$(".admin-edit-modal").modal();

	});

	/* Arrow That Opens Reply Ctn Functionality */
	$(".reply-form-ctn").hide();

	$(".fa-plus-square").click(function() {

		$(this).next('div').slideToggle('fast');

		$(".reset-reply").click();

	});

	/* Close Reply Errors Ctn */
	$(".close-reply-errors-ctn").click(function() {

		$(".reply-errors-ctn").css('display', 'none').children('p').remove();

	});

	/* Close Reply Success Ctn */
	$(".close-reply-success-ctn").click(function() {

		$(".reply-success-ctn").css('display', 'none').children('p').remove();

	});

	/* Close Btn */
	$(".close-btn").click(function() {

		$('.errors-ctn').slideUp('slow', function() {

			$(this).children('p').remove();

		});

	});

	/* New Post Form - AJAX */
	$("#new-post-form").on('submit', function() {

		$('.errors-ctn').children('p').remove();

		$('.form-message').html('<p>Saving... <i class="fa fa-spinner"></i></p>');

		var url 	= $(this).attr('action'),
			method	= $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name  = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					$('.form-message').html("").fadeOut('fast');

					data.errors.forEach(function(error) {

						$(".errors-ctn").append('<p class="text-error">&rsaquo; ' + error + '</p>');

					});

					$(".errors-ctn").slideDown('slow');

				}
				else {

					$('.form-message').html('<p>' + data + '</p>').fadeIn('fast');

					$('.reset').click();

				}

			},
			error: function(data) {

				if(data.status === 403) {

					location.href = "/";

				}
				else {

					console.log(data.statusText);

				}

			}
		});

		return false;

	});

	/* Reply Form - AJAX */
	$(".reply-form").on('submit', function() {

		$(".reply-success-ctn").children('p').remove();

		var url 	= $(this).attr('action'),
			method	= $(this).attr('method'),
			content	= {};

		$(this).find('[name]').each(function(index, value) {

			var name  = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					data.errors.forEach(function(error) {

						$(".reply-errors-ctn").append('<p>&rsaquo; ' + error + '</p>');

					});

					/* Display Errors */
					$(".reply-errors-ctn").css({
						'transition': 'all 0.3s ease-in-out',
						'display': 'block'
					});

					/* Auto Close the Errors in 10 seconds */
					setTimeout(function() {

						$(".reply-errors-ctn").css('display', 'none').children('p').remove();

					}, 10000);

				}
				else {

					if(data.success === true) {

						$(".reply-success-ctn").append('<p>' + data.message + '</p>');

						/* Display Success */
						$(".reply-success-ctn").css({
							'transition': 'all 0.3s ease-in-out',
							'display': 'block'
						});

					}

					$(".reset-reply").click();

				}

			},
			error: function() {

				console.error("Error!");
			
			}
		});

		return false;

	});

	/* All Comments Form - AJAX */
	$(".all-comments-form").on('submit', function() {

		/* Remove Bulletin */
		$("#bulletin").fadeOut('fast');

		var url 	= $(this).attr('action'),
			method	= $(this).attr('method'),
			content	= {};

		$(this).find('[name]').each(function(index, value) {

			var name  = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					if(data.errors === 403) {

						location.href = "/";

					}
					else {

						console.log(data.errors);

					}

				}
				else {

					if(data.success === true) {

						/* Hide the footer */
						$(".footer-ctn").fadeOut('fast');

						/* Set the loader up */
						$(".all-comments-ctn").html("<img class='loader' src='/images/loader.GIF' alt='loader'/>");

						/* Edit the overflow of the page if replies are >= 2 [Avoid double scrollbar!] */
						if(data.post.replies.length >= 2 || $(window).innerHeight() <= 500) {
							
							$('body').css('overflow-y', 'hidden');

						}
						else {

							$('body').css('overflow-y', 'auto');	

						}

						$(".all-comments-ctn").slideDown('fast');

						/* Set the Original Post */
						$(".all-comments-ctn").html
						(
							"<div class='all-comments-original row'>" +
								"<h4>" + data.post.title + " <small>by " + data.post.author.email + "</small></h4>" +
								"<i class='fa fa-close'></i>" +
							"</div>" +
							"<div class='post-content clearfix'>" + 
								"<div>" +
									"<p><span class='fa fa-quote-left'></span>" + data.post.content + "<span class='fa fa-quote-right'></span></p>" +
								"</div>" +
								"<div>" +
									"<small><i class='fa fa-calendar'></i> " + moment(data.post.created).fromNow() + "</small>" +
								"</div>" +
							"</div>" +
							"<div class='row replies-count'>" +
								"<h3>" + data.post.replies.length + " <span class='fa fa-comment-o'></span> Found!</h3>" +
								"<h1 class='fa fa-chevron-down'></h1>" +
							"</div>"
						);

						/* Set the Replies for the original post */
						data.post.replies.forEach(function(reply) {

							$(".all-comments-ctn").append
							(
								"<div class='replies-ctn five columns'>" +
									"<div class='reply-user'>" +
										"<p>" + 
											"<span class='fa fa-mail-reply'></span> " + reply.user + 
										"</p>" +
									"</div>" +
									"<div class='reply-content'>" +
										"<span class='fa fa-quote-left'><span><p>" + reply.content + "</p><span class='fa fa-quote-right'></span>" +
									"</div>" +
									"<div class='reply-created'>" +
										"<small><span class='fa fa-calendar'></span> " + moment(reply.created).fromNow() + "</small>" +
									"</div>" +
									"<span class='fa fa-paperclip'></span>" +
								"</div>" 
							);

						});

						/* Close All Comments Ctn */
						$(".fa-close").click(function() {

							$('.all-comments-ctn').slideUp('fast', function() {

								$(this).html("").css('display', 'none');

								if($('body').css('overflow-y') === 'hidden') {

									$('body').css('overflow-y', 'auto');

								}
								
								$('#bulletin').fadeIn(100);

								$('.footer-ctn').fadeIn('fast');

							});

						});

					}

				}

			},
			error: function() {

				console.error("Error!");
			
			}

		});

		return false;

	});

	/* Like Post Form - AJAX */
	$(".like-form").on('submit', function() {

		var url 	= $(this).attr('action'),
			method	= $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name  = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors && data.errors === 500){

					$(".reply-success-ctn").append("<p>Something went wrong! Try again later!</p>");

					/* Display Success */
					$(".reply-success-ctn").css({
						'transition': 'all 0.3s ease-in-out',
						'display': 'block'
					});

				}
				else if(data.errors && data.errors === 403) {

					$(".reply-errors-ctn").append("<p>" + data.message + "</p>");

					/* Display Success */
					$(".reply-errors-ctn").css({
						'transition': 'all 0.3s ease-in-out',
						'display': 'block'
					});

				}

				else {

					if(data.success === true) {

						$(".reply-success-ctn").append("<p>" + data.message + "</p>");

						/* Display Success */
						$(".reply-success-ctn").css({
							'transition': 'all 0.3s ease-in-out',
							'display': 'block'
						});

					}

				}


			},
			error: function() {

				console.error("Error!");

			}
		});

		return false;

	});

	/* Admin Form - AJAX */
	$("#admin-proposal-form").on('submit', function() {

		$('.admin-errors-ctn').children('p').remove();
		$('.admin-success-ctn').children('p').remove();

		$('.admin-success-ctn').html('<p style="color: #444;">Sending the Email... <i class="fa fa-spinner"></i></p>').fadeIn('fast');

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			beforeSend: function() {

				if($("#checkbox").fieldValue().length === 0) {

					$('.admin-success-ctn').html("").fadeOut('fast');

					$(".admin-errors-ctn").append('<p><i class="fa fa-warning"></i> You must agree to the terms and conditions!</p>').fadeIn('fast');

					return false;

				}
				else {

					return true;

				}

			},
			success: function(data) {

				$(".admin-success-ctn").html("<span>Sending Request... <i class='fa fa-spinner'><i/></span>").fadeIn('fast');

				if(data.errors) {

					$(".admin-success-ctn").html("").fadeOut('fast');

					data.errors.forEach(function(error) {

						$(".admin-errors-ctn").append('<p><i class="fa fa-warning"></i> ' + error + '</p>');

					});

					$(".admin-errors-ctn").fadeIn('fast');

				}
				else {

					$(".admin-success-ctn").html('<p><i class="fa fa-check"><i/> ' + data.message + '</p>').fadeIn('fast');

				}

				$(".reset").click();

			},
		});

		return false;

	});

	/* Admin Login Form - AJAX */
	$(".admin-form").on('submit', function() {

		$(".admin-login-errors-ctn").children('p').remove();

		$(".admin-login-success-ctn").children('p').remove();

		$(".admin-login-success-ctn").html('<span>Attempting Login... <i class="fa fa-spinner"></i></span>').fadeIn('fast');

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();
				
			content[name] = value;

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					$(".admin-login-success-ctn").html("");

					data.errors.forEach(function(error){

						$(".admin-login-errors-ctn").append("<p><i class='fa fa-warning'></i> " + error + "</p>").fadeIn('fast');

					});

				}
				else {

					if(data.success === true) {

						location.href = "/admin";

					}
					else {

						$(".admin-login-success-ctn").html("");

						$(".admin-login-errors-ctn").html('<p><i class="fa fa-times-circle"></i> Login Failed! Please, try again later.</p>');

					}

					$(".reset").click();

				}

			},
			error: function() {

				console.error('Error!');

			}
		});

		return false;

	});

	/* Admin Sign-out AJAX */
	$("#sign-out-form").on('submit', function() {

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value =$(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors && data.errors === 503) {

					location.href = "/";

				}

				if(data.success === true) {

					$('.user-email').html("Redirecting in 5s...");
					
					setTimeout(function() {

						location.href = '/';

					}, 5000);	

				}

			},
			error: function() {

				console.error("Error!");
			
			}
		});

		return false;

	});

	/* All Application Form - AJAX */
	$("#all-applications-form").on('submit', function() {

		$('.applications-ctn').html("<p>Getting Users... <i class='fa fa-spinner'></i></p>").fadeIn('fast');

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					data.errors.forEach(function(error) {

						$('.applications-ctn').append('<p><i class="fa fa-exclamation-triangle"></i> ' + error + '.</p>').fadeIn('fast');

					});

				}

				if(data.length === 0) {

					$('.applications-ctn').html('<p><i class="fa fa-bullhorn"></i> No user has applied for the admin position!</p>').fadeIn('fast');

				}
				else {

					$('.applications-ctn').html("");

					/* Get CSRF Token */
					var csrf = $('#csrf').val();

					data.forEach(function(user) {

						$(".applications-ctn").append(
							'<div class="six columns application">' +
								'<p class="application-email"><i class="fa fa-user"></i> ' + user.email + '</p>' +
								'<div class="application-created">' + 
									'<small><span>Registered</span> - ' + moment(user.created).fromNow() + '</small>' +
								'</div>' +
								'<div class="button-group">' +
									'<form action="/admin/application/approve", method="post", id="application-approve-form">' + 
										'<input type="hidden", name="_csrf", value="' + csrf + '" />' +
										'<input type="hidden", name="userId", value="' + user._id + '" />' +
										'<button class="application-approve" type="submit">Approve</button>' +
									'</form>' +	
									'<form action="/admin/application/reject", method="post", id="application-reject-form">' +
										'<input type="hidden", name="_csrf", value="' + csrf + '" />' +
										'<input type="hidden", name="userId", value="' + user._id + '" />' +
										'<button class="application-reject" type="submit">Reject</button>' +
									'</form>' +
								'</div>' + 
								'<div class="application-success-ctn" style="margin-top: 20px; text-align:center;">' +
								'</div>' +
								'<div class="application-error-ctn" style="margin-top: 20px; text-align:center;">' +
								'</div>' +
							'</div>'
						);

					});

					$('.applications-ctn').fadeIn('fast');						

					/* Approve User for Admin */
					$("#application-approve-form").on('submit', function() {

						$('.application-error-ctn').html("");
						$('.application-success-ctn').html('<p>Concluding Operation... <i class="fa fa-spinner"></i></p>').fadeIn('fast');

						var url = $(this).attr('action'),
							method = $(this).attr('method'),
							content = {};

						$(this).find('[name]').each(function(index, value) {

							var name = $(this).attr('name'),
								value = $(this).val();

							content[name] = value;	

						});

						$.ajax({
							url: url,
							type: method,
							data: content,
							success: function(data) {

								if(data.errors) {

									data.errors.forEach(function(error) {

										$('.application-error-ctn').append("<p style='color: red; font-weight: bold; margin-bottom: 0;'><i class='fa fa-exclamation-triangle'></i> " + error + "</p>");

									});

									$('.application-error-ctn').fadeIn('fast');

								}
								else {

									$('.application-success-ctn').html("<p style='color: green; font-weight: bold;'><i class='fa fa-check'></i> " + data.message + "</p>").fadeIn('fast');

								}

							},
							error: function() {

								console.error("Error!");

							}
						});

						return false;

					});

					/* Reject User for Admin */
					$("#application-reject-form").on('submit', function() {

						$('.application-success-ctn').html('<p>Concluding Operation... <i class="fa fa-spinner"></i></p>').fadeIn('fast');
						$('.application-error-ctn').html("");

						var url = $(this).attr('action'),
							method = $(this).attr('method'),
							content = {};

						$(this).find('[name]').each(function(index, value) {

							var name = $(this).attr('name'),
								value = $(this).val();

							content[name] = value;	

						});

						$.ajax({
							url: url,
							type: method,
							data: content,
							success: function(data) {

								if(data.error) {

									$('.application-error-ctn').html("<p style='color: red; font-weight: bold; margin-bottom: 0;'><i class='fa fa-exclamation-triangle'></i> " + error + "</p>");

									$('.application-error-ctn').fadeIn('fast');

								}
								else {

									$('.application-success-ctn').html("<p style='color: green; font-weight: bold;'><i class='fa fa-check'></i> " + data.message + "</p>").fadeIn('fast');

								}

							},
							error: function() {

								console.error('Error!');

							}
						});

						return false;

					});	

				}

			},
			error: function() {

				console.error('Error!');

			}
		});

		return false;

	});

	/* Admin Edit Form - AJAX */
	$(".admin-edit-form").on('submit', function() {

		$('.admin-edit-success-ctn').html('<p>Updating... <i class="fa fa-spinner"></i></p>').fadeIn('fast');

		$('.admin-edit-errors-ctn').html("");

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					$(".admin-edit-success-ctn").html("").fadeOut('fast');

					data.errors.forEach(function(error) {

						$('.admin-edit-errors-ctn').append('<p><i class="fa fa-exclamation-triangle"></i> ' + error + '</p>');

					});

					$('.admin-edit-errors-ctn').fadeIn('fast');

				}
				else if(data.error && data.error === 500) {

					location.href = '/';

				}
				else {

					$('.admin-edit-success-ctn').html("<p><i class='fa fa-check'></i> " + data.message + "</p>");

				}

			},
			error: function() {

				console.error('Error!');

			}
		});

		return false;

	});

	/* Delete Admin - AJAX */
	$('#admin-delete-form').on('submit', function() {

		$('.admin-delete-success-ctn').html('<p>Updating... <i class="fa fa-spinner"></i></p>').fadeIn('fast');

		$('.admin-delete-errors-ctn').html("");

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					$('.admin-delete-success-ctn').html("").fadeOut('fast');

					data.errors.forEach(function(error) {

						$('.admin-delete-errors-ctn').append("<p><i class='fa fa-exclamation-triangle'></i> " + error + "</p>");

					});

					$('.admin-delete-errors-ctn').fadeIn('fast');

				}
				else if(data.error && data.error === 500) {

					location.href = '/';

				}
				else {

					if(data.code === 200) {

						$('.admin-delete-success-ctn').html("").fadeOut('fast');

						/* Disable UI after admin reset */
						$.blockUI({ 
							message: "<p><i class='fa fa-check'></i> " + data.message + "</p><a style='font-size: 2em; text-decoration: none;' href='/' class='fa fa-home'></a>",
							css: { padding: "10px", border: 'none' } 
						});
					
						setTimeout(function(){

							location.href = '/';

						}, 5000);

					}	

				}

			},
			error: function() {

				console.error('Error!');

			}
		});

		return false;

	});

	/* Delete Post - AJAX */
	$(".delete-post-form").on('submit', function() {

		$('.delete-post').html("");

		var url = $(this).attr('action'),
			method = $(this).attr('method'),
			content = {};

		$(this).find('[name]').each(function(index, value) {

			var name = $(this).attr('name'),
				value = $(this).val();

			content[name] = value;	

		});	

		$.ajax({
			url: url,
			type: method,
			data: content,
			success: function(data) {

				if(data.errors) {

					data.errors.forEach(function(error) {

						$('.delete-post').append("<p class='text-error'><i class='fa fa-exclamation-triangle'></i> " + error + "</p><a href='/', class='fa fa-refresh'></a>")

					});

				}
				else {

					$('.delete-post').append("<p class='text-success'><i class='fa fa-check'></i> " + data.message + "</p><a href='/', class='fa fa-refresh'></a>");

				}

				$('.delete-post-modal').modal();

			},
			error: function() {

				console.error('Error!');

			}
		});

		return false;

	});

});