/*import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';

insert images 
*/
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';
import NavBar from '@/app/ui/navbar';

export default function LoginPage() {
  return (
     <main className="flex flex-col md:h-screen bg-gray-50">
      <div className='flex h-20 w-full items-center justify-center border-2 border-solid border-blue-500'>
        <NavBar/>
      </div>
      <div className="mx-auto flex w-full max-w-[400px] flex-col border-10 border-blue-500 rounded-2xl space-y-2.5 p-4 mt-5 ">
        <div className="flex items-end h-10 w-full border-b-5 border-blue-500 p-3 md:h-20">
          <p className='max-w-full mx-auto text-center text-black font-bold'>iAcademy <br />
          iSope Online</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}