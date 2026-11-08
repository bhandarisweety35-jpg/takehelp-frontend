import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { Protected } from './components/Common'
import Home from './pages/Home'
import { Login, Register } from './pages/Auth'
import Order from './pages/Order'
import { MyOrders, OrderDetail } from './pages/Orders'
import { AdminDash, AdminOrders, AdminOrder, AdminPricing, AdminSettings } from './pages/Admin'
const A = ({ children }) => <Protected admin>{children}</Protected>
export default function App() {
  return <Routes><Route element={<Layout/>}>
    <Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route path="/order" element={<Protected><Order/></Protected>}/>
    <Route path="/my-orders" element={<Protected><MyOrders/></Protected>}/>
    <Route path="/my-orders/:id" element={<Protected><OrderDetail/></Protected>}/>
    <Route path="/admin" element={<A><AdminDash/></A>}/><Route path="/admin/orders" element={<A><AdminOrders/></A>}/>
    <Route path="/admin/orders/:id" element={<A><AdminOrder/></A>}/><Route path="/admin/pricing" element={<A><AdminPricing/></A>}/>
    <Route path="/admin/settings" element={<A><AdminSettings/></A>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>
}
