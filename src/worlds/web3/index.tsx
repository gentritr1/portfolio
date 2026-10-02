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
      role="Frontend Developer (UI and app layer; the wallet/blockchain layer was built by teammates)."
      story={[
        'A dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet; the dashboard shows balances, assets, gas saved and transactions.',
        'I built the UI layer: the dashboard cards (gas saved, transactions, popular tokens), the asset list with grid/table switch, the balance popup with QR address view, the animated onboarding (nickname step), the sign-in overlay, public/private route middleware, the 404 state, the shared components (table, collapse, tooltip, inputs) and the English/French translations.',
      ]}
      facts={[
        'Next.js 14 App Router, TypeScript, RTK Query',
        'Dashboard cards, asset list, balance popup with QR',
        'Passkey / wallet sign-in UI and onboarding animation',
        'Public/private routing middleware',
        'EN / FR',
      ]}
      stack={['Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts']}
      recreationName="Wallet card"
      recreation={<Recreation />}
    />
  )
}
