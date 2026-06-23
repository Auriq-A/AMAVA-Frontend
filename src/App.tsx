import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ScrapedView from './pages/ScrapedView';
import CheckOnAmz from './pages/un_gated';
import FBAProfitCalculatorPage from './pages/ReveneCalculator';
import SalesTable from './pages/Sales';
import SalesMetricsPage from './pages/SalesPerformance';
import Chat from './pages/Chat';
import ScreenshotListener from './pages/Progress';
import ConnectAccounts from './pages/ConnectAccounts';
import Appearance from './pages/Appearance';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route element={<AppShell />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/search' element={<Home />} />
            <Route path='/scraped' element={<ScrapedView />} />
            <Route path='/ungated' element={<CheckOnAmz />} />
            <Route path='/fba-profit-calculator' element={<FBAProfitCalculatorPage />} />
            <Route path='/sales' element={<SalesTable />} />
            <Route path='/sales-performance' element={<SalesMetricsPage />} />
            <Route path='/chat' element={<Chat />} />
            <Route path='/progress' element={<ScreenshotListener />} />
            <Route path='/connect' element={<ConnectAccounts />} />
            <Route path='/appearance' element={<Appearance />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}