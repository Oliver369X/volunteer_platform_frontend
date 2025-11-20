import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  UsersIcon, 
  SparklesIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">VolunteerConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/auth/register/volunteer"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <HeartIcon className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Conectando Voluntarios con
              <span className="text-blue-600"> Impacto Real</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Plataforma inteligente que une a voluntarios con organizaciones que necesitan apoyo.
              Gestión eficiente, matching inteligente y reconocimiento por tu impacto social.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register/volunteer"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Soy Voluntario
              </Link>
              <Link
                to="/auth/register/organization"
                className="bg-slate-800 text-white px-8 py-4 rounded-lg hover:bg-slate-900 transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Soy Organización
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">+1000</div>
              <div className="text-slate-600">Voluntarios Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">+200</div>
              <div className="text-slate-600">Organizaciones</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">+5000</div>
              <div className="text-slate-600">Tareas Completadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Una Plataforma Completa
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar y potenciar el voluntariado
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <SparklesIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Matching Inteligente
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Algoritmo de IA que conecta a voluntarios con tareas según sus habilidades, 
                intereses y disponibilidad para maximizar el impacto.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <UsersIcon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Gestión Centralizada
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Panel de control completo para organizaciones. Crea tareas, asigna voluntarios 
                y monitorea el progreso en tiempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Gamificación
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Sistema de puntos, logros y reconocimientos que motiva y premia 
                el compromiso constante de los voluntarios.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-amber-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Seguridad y Confianza
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Verificación de organizaciones y voluntarios. Historial completo 
                de actividades y evaluaciones de desempeño.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-red-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <LightBulbIcon className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Reportes y Analytics
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Métricas detalladas de impacto social, participación y efectividad 
                para tomar decisiones basadas en datos.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="bg-cyan-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <HeartIcon className="h-7 w-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Comunidad Activa
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Notificaciones en tiempo real, calendario compartido y networking 
                entre voluntarios y organizaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-slate-600">
              Tres simples pasos para comenzar a hacer la diferencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Regístrate
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Crea tu perfil como voluntario u organización. Completa tu información, 
                habilidades e intereses en minutos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Encuentra o Publica
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Voluntarios: busca oportunidades perfectas para ti. Organizaciones: 
                publica tareas y recibe recomendaciones de voluntarios ideales.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                Genera Impacto
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Participa en actividades significativas, gana reconocimientos y 
                contribuye a tu comunidad de forma organizada y efectiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comienza tu Viaje de Voluntariado Hoy
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Únete a cientos de voluntarios y organizaciones que están haciendo la diferencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register/volunteer"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium shadow-lg"
              >
                Registrarme como Voluntario
              </Link>
              <Link
                to="/auth/register/organization"
                className="bg-blue-800 text-white px-8 py-4 rounded-lg hover:bg-blue-900 transition-colors text-lg font-medium shadow-lg border-2 border-white/20"
              >
                Registrar mi Organización
              </Link>
            </div>
            <div className="mt-6">
              <Link
                to="/auth/login"
                className="text-blue-100 hover:text-white underline"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <HeartIcon className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">VolunteerConnect</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Plataforma inteligente de gestión de voluntariado que conecta personas 
                dispuestas a ayudar con organizaciones que necesitan apoyo.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="/auth/login" className="hover:text-white transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register/volunteer" className="hover:text-white transition-colors">
                    Registrarse
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Características
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-slate-400">
                <li>info@volunteerconnect.com</li>
                <li>Santa Cruz, Bolivia</li>
                <li>+591 XXX-XXXX</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} VolunteerConnect. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

