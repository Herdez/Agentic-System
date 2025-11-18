module.exports = {
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    // Permitir variables no utilizadas en producción
    "@typescript-eslint/no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "error",
    
    // Relajar reglas de hooks en producción
    "react-hooks/exhaustive-deps": process.env.NODE_ENV === "production" ? "warn" : "error",
    
    // Otras reglas que pueden causar problemas en CI
    "no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "error"
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "rules": {
        "@typescript-eslint/no-unused-vars": process.env.NODE_ENV === "production" ? "warn" : "error"
      }
    }
  ]
};
