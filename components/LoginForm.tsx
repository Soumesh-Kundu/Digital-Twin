"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Ring } from "ldrs/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import "ldrs/react/Ring.css";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(0),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function googleLogin() {
    await signIn("google", { redirect: true, callbackUrl: "/" });
  }
  async function onLoginSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const signInData = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (signInData?.ok) {
      router.push("/");
    }
    else if (signInData?.status === 401) {
        toast.error("Invalid email or password");
    }
    else if (signInData?.status === 500) {
        toast.error("Server error. Please try again later.");
    }
    setIsLoading(false);
  }
  return (
    <div className="flex flex-col gap-8 px-6  w-full items-center justify-center">
      <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow p-4 sm:p-6 flex flex-col w-full sm:max-w-sm 2xl:max-w-md">
        <h1 className="md:text-3xl text-2xl font-semibold leading-tight tracking-wide text-gray-900 dark:text-white mb-4">
          Login
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onLoginSubmit)}
            className="flex flex-col "
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-3 mt-5">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <p className="text-sm mb-3 font-light text-gray-500 dark:text-gray-400">
              Don't have an account yet ?{" "}
              <Link
                href="#"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Contact Admin
              </Link>
            </p>
            <Button type="submit" className="bg-ui-600! text-white!">
              {isLoading ? (
                <Ring color="white" stroke={1.6} size={20} />
              ) : (
                "Log in"
              )}
            </Button>
            <Link
              href="#"
              className="font-medium text-sm  my-2 text-center text-blue-600 hover:underline dark:text-blue-500"
            >
              Forget Your Password ?
            </Link>
          </form>
        </Form>
      </div>
    </div>
  );
}
