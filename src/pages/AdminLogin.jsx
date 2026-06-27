import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdmin } from "../context/AdminContext";
import { ADMIN_ROUTE } from '../data/constants';
import '../components/ui/components.css';
/**
 * Página de login del panel administrador.
 */
const AdminLogin = () => {
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`${ADMIN_ROUTE}/dashboard`);
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    const result = login(data.username, data.password);
    if (result.success) {
      navigate(`${ADMIN_ROUTE}/dashboard`);
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-login-card">
        <h1>Panel Administrador</h1>
        <p className="admin-login-subtitle">La Masia Pizzería · Acceso restringido</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              className="form-control-masia"
              {...register('username', { required: 'Usuario requerido' })}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-control-masia"
              {...register('password', { required: 'Contraseña requerida' })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>
          <button type="submit" className="btn-primary-masia" style={{ width: '100%' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
