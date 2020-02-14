import Swal from 'sweetalert2';

type BuiltInIcons = 'question' | 'error' | 'info' | 'warning' | 'success';

export default function showToast(icon: BuiltInIcons, text: string) {
  Swal.fire({
    icon,
    text,
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'bottom-right',
  });
}
