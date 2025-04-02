// Auth state management
let currentUser = window.authState?.user || null;

// DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupProtectedLinks();
    setupAuthForms();
    setupProtectedButtons();
  
    const fileInput = document.getElementById('uploadProfilePic');
    const fileNameSpan = document.getElementById('uploadFileName');
  
    if (fileInput && fileNameSpan) {
      fileInput.addEventListener('change', () => {
        const fileName = fileInput.files[0]?.name || 'No file selected';
        fileNameSpan.textContent = fileName;
      });
    }
  
  });
  
// Check auth status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        if (!response.ok) throw new Error('Auth check failed');
        
        const { user } = await response.json();
        currentUser = user;
        updateAuthUI();
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Update UI based on auth state
function updateAuthUI() {
    // Toggle auth-specific elements
    document.querySelectorAll('[data-auth]').forEach(el => {
        el.style.display = el.dataset.auth === (currentUser ? 'logged-in' : 'guest') ? '' : 'none';
    });
    
    // Update user info
    if (currentUser) {
        document.querySelectorAll('[data-user]').forEach(el => {
            el.textContent = currentUser[el.dataset.user];
        });
    }
}

// Setup protected links
function setupProtectedLinks() {
    document.querySelectorAll('a[href="/profile"], a[href="/sell"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                window.location.href = `/login?redirect=${encodeURIComponent(link.getAttribute('href'))}`;
            }
        });
    });
}

// Setup protected buttons
function setupProtectedButtons() {
    document.querySelectorAll('[data-protected]').forEach(button => {
        button.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                return false;
            }
        });
    });
}

// Setup auth forms
function setupAuthForms() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                window.location.href = getRedirectUrl() || '/';
            } else {
                const error = await response.json();
                showError(form, error.message || 'Login failed');
            }
        } catch (error) {
            showError(form, 'Network error. Please try again.');
        }
    });
    
    // Register form
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        
        if (form.password.value !== form.confirmPassword.value) {
            showError(form, 'Passwords do not match');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName.value,
                    dlsuEmail: form.dlsuEmail.value,
                    studentId: form.studentId.value,
                    password: form.password.value
                })
            });
            
            if (response.ok) {
                window.location.href = getRedirectUrl() || '/';
            } else {
                const error = await response.json();
                showError(form, error.message || 'Registration failed');
            }
        } catch (error) {
            showError(form, 'Network error. Please try again.');
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// Helper functions
function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}

function showError(form, message) {
    let errorElement = form.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.prepend(errorElement);
    }
    errorElement.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('a[href="/login"]');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('closeLogin');
    const loginForm = document.getElementById('loginForm');
  
    // Show modal
    loginBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  
    // Close modal
    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  

  
    // Handle login form submission
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
  
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(Object.fromEntries(formData))
        });
  
        if (response.ok) {
          // ✅ Login successful – refresh page to update auth UI
          window.location.reload();
        } else {
          const error = await response.json();
          showError(form, error.message || 'Login failed');
        }
      } catch (err) {
        showError(form, 'Network error. Please try again.');
      }
    });
  
    // Show error message in the modal
    function showError(form, message) {
      let errorEl = form.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        form.prepend(errorEl);
      }
      errorEl.textContent = message;
    }
  });


const modal = document.getElementById('editProfileModal');
const bioTextarea = document.getElementById('editBio');

document.getElementById('editProfileBtn').addEventListener('click', () => {
  modal.style.display = 'flex';

  // Pre-fill existing values
  fetch('/api/auth/profile/data')
    .then(res => res.json())
    .then(data => {
      document.getElementById('editContact').value = data.contactNumber || '';
      document.getElementById('editFacebook').value = data.facebook || '';
      document.getElementById('editProfileImage').value = data.profileImage || '';
      bioTextarea.value = data.bio || '';
      autoGrow(bioTextarea);
    });
});

document.getElementById('cancelProfileBtn').addEventListener('click', () => {
  modal.style.display = 'none';
});
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    const res = await fetch('/api/auth/profile/update', {
      method: 'POST',
      body: formData
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert('Profile updated!');
      location.reload();
    } else {
      alert('Update failed: ' + data.message);
    }
  });
  

// 🔁 Auto-grow bio textarea
function autoGrow(element) {
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}
bioTextarea.addEventListener('input', () => autoGrow(bioTextarea));


document.getElementById('profileImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    const fileInput = document.getElementById('uploadProfilePic');
  
    if (fileInput.files.length === 0) return alert('Please select an image');
  
    formData.append('profileImage', fileInput.files[0]);
  
    const res = await fetch('/api/auth/profile/upload', {
      method: 'POST',
      body: formData
    });
  
    const data = await res.json();
    if (res.ok) {
      alert('Profile picture updated!');
      location.reload(); // or update DOM dynamically
    } else {
      alert('Upload failed.');
    }
  });  


  