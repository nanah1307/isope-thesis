import Osasboard from '@/app/ui/osas/osasboard';
import Osasbar from '../ui/osas/osasbar';
export default function dashboard() {
  return <div>
    <Osasbar/>
    <h1>Dashboard</h1>
    <p>Welcome to the dashboard!</p>
    <Osasboard/>
  </div>
}