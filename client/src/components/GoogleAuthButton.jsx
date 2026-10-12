import { GoogleLogin } from '@react-oauth/google';
export default function GoogleAuthButton({ onSuccess, onError, className = '' }) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;
  return <div className={`google-auth-wrapper ${className}`}><GoogleLogin onSuccess={(response) => onSuccess?.(response.credential)} onError={() => onError?.('Google sign-in failed')} text="continue_with" shape="rectangular" theme="outline" size="large" /></div>;
}
