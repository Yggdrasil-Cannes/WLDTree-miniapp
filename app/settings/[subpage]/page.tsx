import ProfileInfo from '@/components/settings/ProfileInfo';
import SubscriptionPlan from '@/components/settings/SubscriptionPlan';
import Wallet from '@/components/settings/Wallet';
import Notifications from '@/components/settings/Notifications';
import Support from '@/components/settings/Support';
import LegalPrivacy from '@/components/settings/LegalPrivacy';
import Logout from '@/components/settings/Logout';

const subpageMap: Record<string, React.ReactNode> = {
  profile: <ProfileInfo />,
  subscription: <SubscriptionPlan />,
  wallet: <Wallet />,
  notifications: <Notifications />,
  support: <Support />,
  legal: <LegalPrivacy />,
  logout: <Logout />,
};

export default async function SettingsSubpage({ params }: { params: Promise<{ subpage: string }> }) {
  const { subpage } = await params;
  const content = subpageMap[subpage] || <div className="p-4">Not found</div>;
  return content;
} 