// ============================================================
// FSH Empire — Component: Auth (login + register screens)
// ============================================================

const GOOGLE_SVG = `<svg width="18" height="18" viewBox="0 0 48 48">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
</svg>`;

export function renderAuth() {
  const el = document.getElementById('authScreen');
  if (!el) return;

  el.innerHTML = `
  <div class="auth-card">
    <div class="auth-header">
      <div class="auth-logo">FSH EMPIRE</div>
      <div class="auth-tagline">Professional Trading Dashboard</div>
    </div>
    <div class="auth-body">
      <div class="auth-tabs">
        <button class="auth-tab active" onclick="switchAuthTab('login')">Sign In</button>
        <button class="auth-tab" onclick="switchAuthTab('register')">Register</button>
      </div>

      <!-- LOGIN -->
      <div id="loginForm" class="auth-form">
        <div id="loginError" class="auth-error"></div>
        <div id="loginSuccess" class="auth-success-msg"></div>
        <button class="btn-google" onclick="signInWithGoogle()">${GOOGLE_SVG} Continue with Google</button>
        <div class="auth-divider"><span>or</span></div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="loginEmail" placeholder="your@email.com"/>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="loginPassword" placeholder="Your password"
                 onkeydown="if(event.key==='Enter')doLogin()"/>
        </div>
        <button class="btn btn-primary" onclick="doLogin()" id="loginBtn">SIGN IN</button>
        <div style="text-align:center;">
          <span style="font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);cursor:pointer;text-decoration:underline;"
                onclick="forgotPassword()">Forgot password?</span>
        </div>
      </div>

      <!-- REGISTER -->
      <div id="registerForm" class="auth-form" style="display:none;">
        <div id="registerError" class="auth-error"></div>
        <div id="registerSuccess" class="auth-success-msg"></div>
        <div class="step-indicator">
          <div class="step-dot active" id="sdot1">1</div>
          <div class="step-line"></div>
          <div class="step-dot" id="sdot2">2</div>
        </div>

        <!-- STEP 1 -->
        <div id="regStep1" class="reg-step active">
          <button class="btn-google" onclick="signInWithGoogle()">${GOOGLE_SVG} Sign up with Google</button>
          <div class="auth-divider"><span>or create account</span></div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="regName" placeholder="Your full name"/>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="regEmail" placeholder="your@email.com"
                   oninput="validateEmail(this.value)"/>
            <div class="field-error" id="regEmailError"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="regPassword" placeholder="Min. 6 characters"/>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-input" id="regConfirm" placeholder="Repeat password"/>
          </div>
          <button class="btn btn-primary" id="regNextBtn" onclick="regNextStep()">NEXT — CONTACT DETAILS →</button>
        </div>

        <!-- STEP 2 -->
        <div id="regStep2" class="reg-step">
          <div class="form-group">
            <label class="form-label">Country of Residence</label>
            <select class="form-select" id="regCountry" onchange="onCountryChange()">
              <option value="">Select country...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">State / Province</label>
            <select class="form-select" id="regState" onchange="onStateChange()">
              <option value="">Select state/province...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <select class="form-select" id="regCity">
              <option value="">Select state/province first...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Street Address</label>
            <input type="text" class="form-input" id="regAddress" placeholder="e.g. 12 Main Street"
                   oninput="validateAddress()"/>
            <div class="field-error" id="addressError"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Zip / Postal Code</label>
            <input type="text" class="form-input" id="regPostal" placeholder="Postal or zip code"
                   oninput="validatePostal()"/>
            <div class="field-error" id="postalError"></div>
            <div id="postalHint" style="font-family:var(--font-mono);font-size:0.62rem;margin-top:3px;"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div class="phone-wrap">
              <input type="text" class="form-input phone-code" id="regDial" placeholder="+1"
                     readonly style="color:var(--accent);"/>
              <input type="tel" class="form-input" id="regPhone" placeholder="Phone number"
                     oninput="validatePhone()"/>
            </div>
            <div class="field-error" id="phoneError"></div>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-outline" onclick="regPrevStep()" style="flex:1;">← BACK</button>
            <button class="btn btn-primary" onclick="doRegister()" id="registerBtn" style="flex:2;">CREATE ACCOUNT</button>
          </div>
        </div>
      </div>
    </div>
    <div class="auth-footer">🔒 Secured by Supabase Auth &nbsp;·&nbsp; Each trader sees only their own data</div>
  </div>
  `;
}
