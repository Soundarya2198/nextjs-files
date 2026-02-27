"use client";

import styles from "./login.module.css";
import { useForm } from "react-hook-form";
import { LoginSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod"
import {useRouter} from "next/navigation"

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter()
  const { register, setError, handleSubmit, formState: {errors} } = useForm<FormData>({
     resolver: zodResolver(LoginSchema)
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })

    const result = await res.json();
    if(!res.ok){
      setError("email" , {
        message: "Invalid credentials"
      })
      return;
    }else{
      localStorage.setItem("token", result.token)
      router.push("/dashboard")
    }

  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            {...register("email")}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className={styles.input}
          />
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
