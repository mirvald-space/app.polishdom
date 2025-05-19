import { redirect } from "next/navigation";

export default function HomePage() {
  // Перенаправляем пользователя на страницу курсов
  redirect("/courses");
}
