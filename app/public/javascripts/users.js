/* eslint-disable no-undef */
const USER_PENDING = 0;
const USER_STARTED = 1;
const USER_SUSPEND = 2;
const USER_INVITED = 3;

function userDetail() {
  const id = $(this).attr('data-id');
  $.post('/user/detail', { id }, res => {
    $('#first-name').val(res.user.first_name);
    $('#last-name').val(res.user.last_name);
    $('#detail-email').val(res.user.email_address);
    $('#user-id').val(id);
    const { status } = res.user;
    $('#status').val(status);
  });
}

function saveUserInfo() {
  const id = $('#user-id').val();
  const email = $('#detail-email').val();
  const status = $('#status').val();
  const firstName = $('#first-name').val();
  const lastName = $('#last-name').val();

  $.post('/user/save', { id, firstName, lastName, email, status }, res => {
    if (res.success) {
      Swal.fire({
        title: 'Saved successfully!',
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      }).then(_ => {
        $('#user-id').val('');
        window.location.reload();
      });
    }
  });
}
function userSuspend() {
  const id = $(this).attr('data-id');
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger mr-2',
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    reverseButtons: true,
  }).then(result => {
    if (result.value) {
      $.post('/user/suspend', { id }, _ => {
        window.location.reload();
      });
    }
  });
}

function userInvite() {
  const email = $('#email').val();
  if (email !== '') {
    $.post('/invite', { email }, (res, _status) => {
      $('#email').val('');
      if (res.success) {
        Swal.fire({
          title: `Invite successfully sent to ${email}`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        }).then(_ => {
          window.location.reload();
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
    });
  } else {
    Swal.fire({
      title: 'Enter the email!',
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });
  }
}

$(() => {
  $('#login-form').ajaxForm(res => {
    if (res.success === false) {
      Swal.fire({
        title: res.error.message,
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      });
    } else {
      window.location.href = '/users';
    }
  });
  $('#sign-up').ajaxForm(res => {
    if (res.success === false) {
      Swal.fire({
        title: res.data[0].message,
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      });
    } else {
      Swal.fire({
        title: 'Successfully registered.',
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      }).then(_ => {
        window.location.href = '/login';
      });
    }
  });
});

$(document).ready(() => {
  $('#userList').DataTable({
    ajax: {
      url: '/datatable/user',
      type: 'POST',
    },
    columnDefs: [
      {
        width: 150, targets: '_all',
      },
      { orderable: true, targets: '_all' },
    ],
    columns: [{
      title: 'First Name',
      data: 'first_name',
    }, {
      title: 'Last Name',
      data: 'last_name',
    }, {
      title: 'Email',
      data: 'email_address',
    }, {
      title: 'Status',
      data: 'status',
      // eslint-disable-next-line consistent-return
      render(data, _type, _row) {
        if (data === USER_PENDING) {
          return 'Pending';
        } if (data === USER_STARTED) {
          return 'Confirmed';
        } if (data === USER_SUSPEND) {
          return 'Suspened';
        } if (data === USER_INVITED) {
          return 'Invited';
        }
      },
    }, { title: 'Action',
      orderable: false,
      width: 250,
      data: null,
      render(data, _type, _row) {
        const url = `druidapp:///ent/0/members/${data.id}/tests/0/baseurl/${window.location.hostname}/access/${data.token}/score/show`;
        return `<a class="btn btn-success btn-sm" href="${url}" target="_blank" alt="Start a test now"> <i class="fas fa-vial"></i> </a>
        <button class="btn btn-primary btn-sm" onClick="setSchedule()" alt="Schedule test"> <i class="fa fa-calendar-alt"></i></button>
        <button class="btn btn-secondary btn-sm btnDetails" data-toggle="modal" data-target=".popUpMessage" data-id="${data.id}" alt="Edit user details"> <i class="fa fa-edit"></i></button>
        <button class="btn btn-danger btn-sm btnSuspend" data-id="${data.id}" alt="Suspend user account"> <i class="fa fa-times"></i> </button>`;
      } }],
    initComplete: () => {
      $('#btnInvite').click(userInvite);
      $('.btnDetails').click(userDetail);
      $('#btnUserInfoSave').click(saveUserInfo);
      $('.btnSuspend').click(userSuspend);
    },
  });
});
