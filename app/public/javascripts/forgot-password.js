/* eslint-disable consistent-return */
/* eslint-disable no-undef */
function validation() {
  if ($('#email').val() === '') {
    $('#email').addClass('is-invalid');
    $('.invalid-feedback').attr('display: block');
    return false;
  }
  $('#email').removeClass('is-invalid');
  $('.invalid-feedback').attr('display: none');
  return true;
}

$('#forgot-form').submit(e => {
  e.preventDefault();
  // check if the input is valid
  if (!validation()) return false;

  $.ajax({
    method: 'POST',
    url: '/account/forgot-password',
    data: {
      email: $('#email').val(),
    },
    success: (res => {
      if (res.success) {
        Swal.fire({
          title: '<p>We&apos;ve sent you a link to update your password.</p>',
          html: `<p class="text-center">If the email doesn&rsquo;t arrive after a few minutes, try checking your spam folder. 
          If you still can&rsquo;t find it, please try again, or `
          + '<a href="mailto:support@druidapp.com">contact support</a>.</p>'
          + '<p class="text-center"><a class="btn btn-outline-primary" href="/login">Back to login</a></p>',
          showConfirmButton: false,
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        }).then(_ => {
          window.location.href = '/login';
        });
      } else {
        Swal.fire({
          title: res.message,
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        }).then(_ => {
          window.location.reload();
        });
      }
    }),
  });
});

$(document).ready(() => {
  $('#email').val('');
  $('#reset').click(validation);
});
