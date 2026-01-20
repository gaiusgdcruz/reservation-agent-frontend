# Reservation Agent - Frontend

This is the React/Vite frontend for the Reservation Helpline, featuring a premium UI and real-time interaction logs.

## 🚀 Deployment Instructions (Vercel)

1.  **Create GitHub Repo**: Create a new repository on GitHub named `reservation-agent-frontend`.
2.  **Push Code**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/reservation-agent-frontend.git
    git branch -M main
    git push -u origin main
    ```
3.  **Deploy on Vercel**:
    - Log in to [Vercel](https://vercel.com).
    - **Add New** -> **Project**.
    - Import your `reservation-agent-frontend` repository.
    - **Environment Variables**: Add any necessary environment variables (though the frontend primarily connects via the LiveKit room supplied by the backend).
    - Click **Deploy**.

## Local Development

1.  Install dependencies: `npm install`
2.  Run dev server: `npm run dev`
