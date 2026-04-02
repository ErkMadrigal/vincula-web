import Swal from 'sweetalert2'

const swal = Swal.mixin({
  confirmButtonColor: '#6B4FBB',
  cancelButtonColor: '#ece9f8',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  borderRadius: '16px',
  customClass: {
    popup: 'swal-vincula',
    title: 'swal-vincula-title',
    htmlContainer: 'swal-vincula-text',
    confirmButton: 'swal-vincula-confirm',
    cancelButton: 'swal-vincula-cancel',
  },
})

export default swal
