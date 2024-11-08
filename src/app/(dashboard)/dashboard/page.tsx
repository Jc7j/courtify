import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/next-auth';
import { ROUTES } from '@/constants/routes';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/Button';

export default async function DashboardPage() {
  // const session = await getServerSession(authOptions);

  //   redirect(ROUTES.AUTH.SIGNIN);
  // }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome</p>
      <Button>Click me</Button>
    </div>
  );
} 
