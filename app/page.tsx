import { cookies } from 'next/headers'; // Import cookies from next/headers
import type { User } from "@/types/user";
import { createClient } from '@/ultis/supabase/server'; // Đảm bảo đường dẫn đúng
import AuthFlowClient from "@/components/auth-flow-client"; // Import the new client component

// Component phải là `async` để có thể dùng `await`
export default async function MyDataPage() {
  // Tạo Supabase client phía server. Nó sẽ tự động truy cập cookies.
  const supabase = createClient();
  
  // Fetch user session from Supabase on the server
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  let initialUser: User | null = null;

  if (session && session.user) {
    // Map Supabase user to your User type if necessary
    initialUser = {
      id: session.user.id,
      email: session.user.email ?? '',
      role: session.user.user_metadata?.role ?? 'user', // Assuming role is in user_metadata
      // Add other properties from Supabase user to your User type
    };
  }

  if (sessionError) {
    console.error('Lỗi khi lấy session từ Supabase:', sessionError);
    // Handle error: redirect to login or show a generic error
    // return <Redirect to="/login" />; // Example of redirecting to login
  }

  // You can also fetch other data here if needed for the initial render
  // const { data: someOtherData, error: someOtherError } = await supabase.from('your_table').select('*');

  // Pass the initial user (or other server-fetched data) to the client component
  return (
    <AuthFlowClient initialUser={initialUser} />
  );
}
