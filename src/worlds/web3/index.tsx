import { World } from '../../components/World'
import { Recreation } from './Recreation'

export function Web3World() {
  return (
    <World
      world="web3"
      layout="stage-wide"
      stageAspect="21 / 9"
      stageAspectTablet="6 / 5"
      stageAspectMobile="3 / 4"
      title="The frontend of a smart‑wallet dashboard"
      meta={['Web3', 'Smart wallet', 'Web']}
      role="Frontend, UI layer"
      story={[
        'A smart-wallet dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet, then see balances, assets, gas saved and transactions.',
        'The frontend is built on Next.js 14 with the App Router and RTK Query. It covers the passkey and wallet sign-in UI, animated onboarding, dashboard cards, an asset list, a balance popup with a QR address, route middleware and English/French translations. Teammates built the wallet and blockchain layer.',
      ]}
      facts={[
        'Next.js 14 App Router, TypeScript, RTK Query',
        'Passkey and wallet sign-in UI',
        'Dashboard cards, asset list, balance popup with QR',
        'Animated onboarding',
        'Public and private route middleware',
        'English and French',
      ]}
      stack={['Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts']}
      recreationName="Wallet card"
      recreation={<Recreation />}
    />
  )
}
