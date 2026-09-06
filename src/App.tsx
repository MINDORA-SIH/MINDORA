import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AutoTranslateUi } from './components/AutoTranslateUi';

export default function App() {
  return <AutoTranslateUi><RouterProvider router={router} /></AutoTranslateUi>;
}
