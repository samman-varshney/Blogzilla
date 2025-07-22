
  function showToast(type, message) {
    const toastTypes = {
      success: {
        id: 'successToast',
        icon: 'bi-check-circle-fill',
        class: 'bg-success text-white'
      },
      warning: {
        id: 'warningToast',
        icon: 'bi-exclamation-triangle-fill',
        class: 'bg-warning text-dark'
      },
      danger: {
        id: 'dangerToast',
        icon: 'bi-x-octagon-fill',
        class: 'bg-danger text-white'
      }
    };

    const toastInfo = toastTypes[type];
    if (!toastInfo) return;

    const toastContainer = document.getElementById('toastContainer');
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 rounded-3 shadow mb-2 ${toastInfo.class}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.setAttribute('min-width', '100px');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center">
          <i class="bi ${toastInfo.icon} me-2 fs-5"></i>
          ${message}
        </div>
        <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

