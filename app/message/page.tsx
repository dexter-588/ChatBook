import { redirect } from 'next/navigation';

export default function MessageRedirect() {
  redirect('/user/message');
}
