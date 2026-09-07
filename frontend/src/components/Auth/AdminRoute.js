import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0a0f1e',color:'#f97316',fontSize:'20px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login"/>;
  if (user.role !== 'admin') return <Navigate to="/"/>;
  return children;
};
export default AdminRoute;