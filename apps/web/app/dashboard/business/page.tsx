import { redirect } from 'next/navigation';

// Business management moved to the dedicated business dashboard (/biz).
export default function MyBusinessPage() {
  redirect('/biz/profile');
}
