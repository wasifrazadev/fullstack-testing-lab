<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    // GET /api/todos
    public function index(): JsonResponse
    {
        return response()->json(Todo::all());
    }

    // POST /api/todos
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo = Todo::create($validated);

        return response()->json($todo, 201);
    }

    // GET /api/todos/{id}
    public function show(int $id): JsonResponse
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return response()->json([
                'message' => 'Todo not found.',
            ], 404);
        }

        return response()->json($todo);
    }

    // PUT /api/todos/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return response()->json([
                'message' => 'Todo not found.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo->update($validated);

        return response()->json($todo->fresh());
    }

    // DELETE /api/todos/{id}
    public function destroy(int $id): JsonResponse
    {
        $todo = Todo::find($id);

        if (!$todo) {
            return response()->json([
                'message' => 'Todo not found.',
            ], 404);
        }

        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully.',
        ]);
    }
}