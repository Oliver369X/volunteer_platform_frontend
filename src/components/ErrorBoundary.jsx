'use strict';

import { Component } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 gradient-mesh p-4">
          <div className="w-full max-w-2xl rounded-3xl border-2 border-red-200 bg-white/95 backdrop-blur-xl p-8 sm:p-12 shadow-2xl animate-scale-in text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
              <ExclamationTriangleIcon className="h-10 w-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-ink mb-3">
              ¡Ups! Algo salió mal 😔
            </h1>

            {/* Description */}
            <p className="text-muted mb-6 max-w-md mx-auto">
              Ocurrió un error inesperado en la aplicación. No te preocupes, tu información está segura.
            </p>

            {/* Error details (solo en desarrollo) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700 mb-2">
                  Ver detalles técnicos
                </summary>
                <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 text-xs font-mono text-red-800 overflow-auto max-h-60">
                  <p className="font-bold mb-2">Error:</p>
                  <p className="mb-4">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <>
                      <p className="font-bold mb-2">Stack Trace:</p>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Recargar Aplicación
              </button>
              
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-ink shadow-lg transition-all hover:border-primary hover:bg-primary/5 button-hover"
              >
                🏠 Volver al Inicio
              </a>
            </div>

            {/* Additional help */}
            <div className="mt-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Si el problema persiste, intenta:
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 text-left max-w-md mx-auto">
                <li>• Cerrar sesión y volver a iniciar</li>
                <li>• Limpiar caché del navegador</li>
                <li>• Verificar tu conexión a internet</li>
                <li>• Contactar al soporte técnico</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

