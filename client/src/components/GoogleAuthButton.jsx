/**
 * GoogleAuthButton — Styled Google OAuth sign-in button (owner-only).
 * Wraps @react-oauth/google's GoogleLogin component.
 */

import { GoogleLogin } from '@react-oauth/google';

export default function GoogleAuthButton({ onSuccess, onError, text = 'signin_with' }) {
  return (
    <div className="google-auth-btn" id="google-auth-button">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (onSuccess) onSuccess(credentialResponse.credential);
        }}
        onError={() => {
          if (onError) onError('Google sign-in failed');
        }}
        text={text}
        shape="rectangular"
        theme="filled_black"
        size="large"
        width="100%"
        logo_alignment="left"
      />
    </div>
  );
}
