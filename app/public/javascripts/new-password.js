/* eslint-disable consistent-return */
/* eslint-disable no-undef */
function validation() {
  if ($('#password').val() === '' || ($('#password').val() !== $('#confirm-password').val())) {
    $('#password').addClass('is-invalid');
    $('#confirm-password').addClass('is-invalid');
    $('.invalid-feedback').attr('display: block');
    return false;
  }
  $('#password').removeClass('is-invalid');
  $('#confirm-password').removeClass('is-invalid');
  $('.invalid-feedback').attr('display: none');
  return true;
}

$('#new-password').submit(e => {
  e.preventDefault();
  // check if the input is valid
  if (!validation()) return false;

  $.ajax({
    type: 'POST',
    url: '/account/new-password',
    data: {
      password: $('#password').val(),
    },
    success: (res => {
      Swal.fire({
        title: res.message,
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      }).then(_ => {
        window.location.href = '/login';
      });
    }),
  });
});

$(document).ready(() => {
  $('#password').val('');
  $('#confirm-password').val('');
  $('#new').click(validation);
});
