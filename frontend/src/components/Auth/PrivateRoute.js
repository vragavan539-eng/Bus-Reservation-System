import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#0a0f1e',color:'#f97316',fontSize:'20px'}}>Loading...</div>;
  return user ? children : <Navigate to="/login"/>;
};
export default PrivateRoute;