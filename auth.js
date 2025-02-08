const SUPABASE_URL = 'https://htvyyrenzsqbcfjlljmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnl5cmVuenNxYmNmamxsam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMDQ4NjYsImV4cCI6MjA1NDU4MDg2Nn0.8M4tbHeD6Y9Qw_-GrKnGoa63GJQMq1_lObEh2jJjkvA';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Supabase object:', window.supabase); // Check if supabase is accessible
    if (window.supabase) {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); //This should be `window.supabase`
    } else {
      console.error('Supabase is not properly loaded.');
      return; // Exit if supabase is not loaded
    }
  
    let isLogin = true;
  
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const submitButton = document.getElementById('submitButton');
    const toggleAuth = document.getElementById('toggleAuth');
  
    toggleAuth.addEventListener('click', () => {
      isLogin = !isLogin;
      authTitle.textContent = isLogin ? 'Login' : 'Register';
      submitButton.textContent = isLogin ? 'Login' : 'Register';
      toggleAuth.textContent = isLogin ? 'Switch to Register' : 'Switch to Login';
    });
  
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          alert('Logged in successfully!');
          window.location.href = "index.html"; // Redirect to home.html after successful login
        } else {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          alert('Registered successfully! Check your email for confirmation.');
        }
      } catch (error) {
        alert(error.message);
      }
    });
  });
