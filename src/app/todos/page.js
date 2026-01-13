"use client";
import { useQuery } from "@tanstack/react-query";
export default function TodosPage() {
    const { data = [] } = useQuery({
        queryKey: ["todos"],
        queryfn: () => fetch("/api/todos").then(res => res.json()),
    });
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Todos</h1>
            {data.map(todo => (
                <div key={todo.id} className="border p-4 mt-2">
                    <h3>{todo.title}</h3>
                    <p>{todo.description}</p>
                    <span>{todo.status}</span>
                </div>
            ))}
        </div>

    );
}