export const privyConfig = {
  appId: process.env.REACT_APP_PRIVY_APP_ID || 'cmcqvshhd038pl20mdyqpfz3g',
  
  appearance: {
    theme: 'dark',
    accentColor: '#ff006e',
    landingHeader: '🌈 Connect with Privy',
    landingSubheader: 'Secure, simple, and social wallet connection'
  },
  
  loginMethods: ['wallet', 'email', 'sms', 'google'], // Google OAuth - setup in Privy Console if needed
  
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    noPromptOnSignature: false,
  },
  
  mfa: {
    noPromptOnMfaRequired: false,
  }
}; 