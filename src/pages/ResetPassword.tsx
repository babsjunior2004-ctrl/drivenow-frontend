import { useState } from "react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(
      "Si un compte existe avec cette adresse, contactez votre administrateur pour réinitialiser votre mot de passe.",
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Réinitialiser le mot de passe
        </h2>

        {message && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-700 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-300"
          >
            Envoyer la demande
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
