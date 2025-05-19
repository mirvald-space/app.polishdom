"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Course, Module, Lesson, Quiz, QuizQuestion, QuizOption } from "@/lib/schemas/lms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Plus, Save, Trash, ArrowUp, ArrowDown, CheckCircle, Circle, FileQuestion, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectItem } from "@/components/ui/select";

interface CourseContentEditorProps {
  course: Course;
}

export function CourseContentEditor({ course }: CourseContentEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course>({ ...course });
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Обработчик сохранения курса
  const handleSaveCourse = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedCourse,
          modules: editedCourse.modules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось обновить курс');
      }

      toast.success("Содержание курса успешно обновлено");
      router.refresh();
    } catch (error) {
      console.error('Error updating course content:', error);
      toast.error("Не удалось обновить содержание курса");
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление нового модуля
  const handleAddModule = () => {
    const newModuleId = `module-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      title: "Новый модуль",
      description: "Описание модуля",
      order: editedCourse.modules.length + 1,
      lessons: [],
    };
    
    setEditedCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    
    setActiveModuleId(newModuleId);
    setEditingModuleId(newModuleId);
  };

  // Обновление модуля
  const handleUpdateModule = (moduleId: string, data: Partial<Module>) => {
    setEditedCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId ? { ...module, ...data } : module
      ),
    }));
  };

  // Удаление модуля
  const handleDeleteModule = (moduleId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот модуль? Это действие нельзя отменить.")) {
      setEditedCourse(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module.id !== moduleId),
      }));
      
      if (activeModuleId === moduleId) {
        setActiveModuleId(null);
      }
      
      if (editingModuleId === moduleId) {
        setEditingModuleId(null);
      }
      
      toast.success("Модуль удален");
    }
  };

  // Добавление нового урока
  const handleAddLesson = (moduleId: string) => {
    const newLessonId = `lesson-${Date.now()}`;
    const newLesson: Lesson = {
      id: newLessonId,
      title: "Новый урок",
      content: "# Новый урок\n\nСодержимое урока",
      order: getModuleLessons(moduleId).length + 1,
      duration: 30,
    };
    
    setEditedCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, lessons: [...module.lessons, newLesson] } 
          : module
      ),
    }));
    
    setActiveModuleId(moduleId);
    setActiveLessonId(newLessonId);
    setEditingLessonId(newLessonId);
  };

  // Обновление урока
  const handleUpdateLesson = (moduleId: string, lessonId: string, data: Partial<Lesson>) => {
    setEditedCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              lessons: module.lessons.map(lesson => 
                lesson.id === lessonId 
                  ? { ...lesson, ...data } 
                  : lesson
              ) 
            } 
          : module
      ),
    }));
  };

  // Удаление урока
  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот урок? Это действие нельзя отменить.")) {
      setEditedCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module => 
          module.id === moduleId 
            ? { 
                ...module, 
                lessons: module.lessons.filter(lesson => lesson.id !== lessonId) 
              } 
            : module
        ),
      }));
      
      if (activeLessonId === lessonId) {
        setActiveLessonId(null);
      }
      
      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
      }
      
      toast.success("Урок удален");
    }
  };

  // Изменение порядка модулей
  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = editedCourse.modules.findIndex(m => m.id === moduleId);
    
    if (
      (direction === 'up' && moduleIndex <= 0) || 
      (direction === 'down' && moduleIndex >= editedCourse.modules.length - 1)
    ) {
      return;
    }
    
    const newModules = [...editedCourse.modules];
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    
    // Меняем модули местами
    [newModules[moduleIndex], newModules[targetIndex]] = 
      [newModules[targetIndex], newModules[moduleIndex]];
    
    // Обновляем порядок всех модулей
    const updatedModules = newModules.map((module, idx) => ({
      ...module,
      order: idx + 1
    }));
    
    setEditedCourse(prev => ({
      ...prev,
      modules: updatedModules,
    }));
  };

  // Изменение порядка уроков
  const handleMoveLesson = (moduleId: string, lessonId: string, direction: 'up' | 'down') => {
    const moduleIndex = editedCourse.modules.findIndex(m => m.id === moduleId);
    const lessons = editedCourse.modules[moduleIndex].lessons;
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    
    if (
      (direction === 'up' && lessonIndex <= 0) || 
      (direction === 'down' && lessonIndex >= lessons.length - 1)
    ) {
      return;
    }
    
    const newLessons = [...lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    
    // Меняем уроки местами
    [newLessons[lessonIndex], newLessons[targetIndex]] = 
      [newLessons[targetIndex], newLessons[lessonIndex]];
    
    // Обновляем порядок всех уроков
    const updatedLessons = newLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1
    }));
    
    setEditedCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, idx) => 
        idx === moduleIndex 
          ? { ...module, lessons: updatedLessons } 
          : module
      ),
    }));
  };

  // Получение уроков модуля
  const getModuleLessons = (moduleId: string) => {
    const module = editedCourse.modules.find(m => m.id === moduleId);
    return module ? module.lessons : [];
  };

  // Добавляем функцию для создания нового теста для урока
  const handleAddQuiz = (moduleId: string, lessonId: string) => {
    const newQuiz: Quiz = {
      questions: [
        {
          id: `question-${Date.now()}`,
          text: "Новый вопрос",
          type: "single",
          options: [
            { id: `option-1-${Date.now()}`, text: "Вариант 1", isCorrect: true },
            { id: `option-2-${Date.now()}`, text: "Вариант 2", isCorrect: false },
            { id: `option-3-${Date.now()}`, text: "Вариант 3", isCorrect: false },
            { id: `option-4-${Date.now()}`, text: "Вариант 4", isCorrect: false },
          ]
        }
      ],
      passingScore: 70
    };

    handleUpdateLesson(moduleId, lessonId, { quiz: newQuiz });
  };

  // Добавляем функцию для добавления нового вопроса
  const handleAddQuestion = (moduleId: string, lessonId: string) => {
    const lesson = editedCourse.modules
      .find(m => m.id === moduleId)?.lessons
      .find(l => l.id === lessonId);
    
    if (!lesson || !lesson.quiz) return;
    
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      text: "Новый вопрос",
      type: "single",
      options: [
        { id: `option-1-${Date.now()}`, text: "Вариант 1", isCorrect: true },
        { id: `option-2-${Date.now()}`, text: "Вариант 2", isCorrect: false },
        { id: `option-3-${Date.now()}`, text: "Вариант 3", isCorrect: false },
        { id: `option-4-${Date.now()}`, text: "Вариант 4", isCorrect: false },
      ]
    };
    
    const questions = lesson.quiz.questions || [];
    
    handleUpdateLesson(moduleId, lessonId, { 
      quiz: {
        ...lesson.quiz,
        questions: [...questions, newQuestion]
      } 
    });
  };

  // Обновляем вопрос в тесте
  const handleUpdateQuestion = (
    moduleId: string, 
    lessonId: string, 
    questionId: string, 
    data: Partial<QuizQuestion>
  ) => {
    const lesson = editedCourse.modules
      .find(m => m.id === moduleId)?.lessons
      .find(l => l.id === lessonId);
    
    if (!lesson || !lesson.quiz || !lesson.quiz.questions) return;
    
    const updatedQuestions = lesson.quiz.questions.map(q => 
      q.id === questionId ? { ...q, ...data } : q
    );
    
    const updatedQuiz: Quiz = {
      ...lesson.quiz,
      questions: updatedQuestions
    };
    
    handleUpdateLesson(moduleId, lessonId, { quiz: updatedQuiz });
  };

  // Удаляем вопрос из теста
  const handleDeleteQuestion = (moduleId: string, lessonId: string, questionId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот вопрос?")) return;
    
    const lesson = editedCourse.modules
      .find(m => m.id === moduleId)?.lessons
      .find(l => l.id === lessonId);
    
    if (!lesson || !lesson.quiz || !lesson.quiz.questions) return;
    
    const updatedQuestions = lesson.quiz.questions.filter(q => q.id !== questionId);
    
    const updatedQuiz: Quiz = {
      ...lesson.quiz,
      questions: updatedQuestions
    };
    
    handleUpdateLesson(moduleId, lessonId, { quiz: updatedQuiz });
  };

  // Обновляем вариант ответа
  const handleUpdateOption = (
    moduleId: string, 
    lessonId: string, 
    questionId: string, 
    optionId: string, 
    data: { text?: string; isCorrect?: boolean }
  ) => {
    const lesson = editedCourse.modules
      .find(m => m.id === moduleId)?.lessons
      .find(l => l.id === lessonId);
    
    if (!lesson || !lesson.quiz || !lesson.quiz.questions) return;
    
    const question = lesson.quiz.questions.find(q => q.id === questionId);
    
    if (!question || !question.options) return;
    
    // Для single-типа нужно убедиться, что только один вариант отмечен как правильный
    let updatedOptions = [...question.options];
    
    if (data.isCorrect && question.type === 'single') {
      updatedOptions = updatedOptions.map(o => ({
        ...o,
        isCorrect: o.id === optionId
      }));
    } else {
      updatedOptions = updatedOptions.map(o => 
        o.id === optionId ? { ...o, ...data } : o
      );
    }
    
    const updatedQuestions = lesson.quiz.questions.map(q => 
      q.id === questionId ? { ...q, options: updatedOptions } : q
    );
    
    const updatedQuiz: Quiz = {
      ...lesson.quiz,
      questions: updatedQuestions
    };
    
    handleUpdateLesson(moduleId, lessonId, { quiz: updatedQuiz });
  };

  // Обновляем проходной балл
  const handleUpdatePassingScore = (moduleId: string, lessonId: string, score: number) => {
    const lesson = editedCourse.modules
      .find(m => m.id === moduleId)?.lessons
      .find(l => l.id === lessonId);
    
    if (!lesson || !lesson.quiz) return;
    
    const updatedQuiz: Quiz = {
      ...lesson.quiz,
      passingScore: score
    };
    
    handleUpdateLesson(moduleId, lessonId, { quiz: updatedQuiz });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Содержание курса</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddModule}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Добавить модуль
          </Button>
          <Button 
            onClick={handleSaveCourse}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Сохранение...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                Сохранить изменения
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {editedCourse.modules.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-4">У курса еще нет модулей</p>
              <Button onClick={handleAddModule} variant="outline" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Добавить первый модуль
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={activeModuleId || undefined}
            onValueChange={(value) => setActiveModuleId(value || null)}
            className="space-y-2"
          >
            {editedCourse.modules.map((module) => (
              <Card key={module.id} className="overflow-hidden">
                <AccordionItem value={module.id} className="border-none">
                  {editingModuleId === module.id ? (
                    <CardHeader className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`module-title-${module.id}`}>Название модуля</Label>
                          <Input
                            id={`module-title-${module.id}`}
                            value={module.title}
                            onChange={(e) => handleUpdateModule(module.id, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`module-desc-${module.id}`}>Описание модуля</Label>
                          <Textarea
                            id={`module-desc-${module.id}`}
                            value={module.description}
                            onChange={(e) => handleUpdateModule(module.id, { description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingModuleId(null)}
                          >
                            Готово
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  ) : (
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                            {module.order}
                          </div>
                          <span className="font-medium">{module.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {module.lessons.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {module.lessons.length} {module.lessons.length === 1 ? 'урок' : 
                              module.lessons.length < 5 ? 'урока' : 'уроков'}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                  )}
                  <AccordionContent className="px-4 pb-4">
                    <div className="mb-3 flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveModule(module.id, 'up')}
                          disabled={module.order <= 1}
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveModule(module.id, 'down')}
                          disabled={module.order >= editedCourse.modules.length}
                          className="h-8 w-8"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingModuleId(module.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(module.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Список уроков */}
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Уроки</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddLesson(module.id)}
                          className="h-8 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Добавить урок
                        </Button>
                      </div>

                      {module.lessons.length === 0 ? (
                        <div className="text-center p-4 border border-dashed rounded-md">
                          <p className="text-sm text-muted-foreground">В этом модуле еще нет уроков</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div 
                              key={lesson.id}
                              className={cn(
                                "border rounded-md p-3",
                                editingLessonId === lesson.id && "border-primary"
                              )}
                            >
                              {editingLessonId === lesson.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label htmlFor={`lesson-title-${lesson.id}`}>Название урока</Label>
                                    <Input
                                      id={`lesson-title-${lesson.id}`}
                                      value={lesson.title}
                                      onChange={(e) => handleUpdateLesson(module.id, lesson.id, { title: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`lesson-content-${lesson.id}`}>Содержимое урока (Markdown)</Label>
                                    <Textarea
                                      id={`lesson-content-${lesson.id}`}
                                      value={lesson.content}
                                      onChange={(e) => handleUpdateLesson(module.id, lesson.id, { content: e.target.value })}
                                      rows={10}
                                      className="font-mono text-sm"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`lesson-duration-${lesson.id}`}>Длительность (мин)</Label>
                                      <Input
                                        id={`lesson-duration-${lesson.id}`}
                                        type="number"
                                        value={lesson.duration || 0}
                                        onChange={(e) => handleUpdateLesson(module.id, lesson.id, { duration: parseInt(e.target.value) || 0 })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`lesson-video-${lesson.id}`}>Видео URL (опционально)</Label>
                                      <Input
                                        id={`lesson-video-${lesson.id}`}
                                        value={lesson.videoUrl || ''}
                                        onChange={(e) => handleUpdateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                        placeholder="https://example.com/video.mp4"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <Label className="mb-2 block">Тест</Label>
                                    
                                    {!lesson.quiz ? (
                                      <div className="border border-dashed rounded-md p-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-2">К этому уроку не добавлен тест</p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddQuiz(module.id, lesson.id)}
                                          className="flex items-center gap-1"
                                        >
                                          <PlusCircle className="h-3 w-3" />
                                          Добавить тест
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="border rounded-md p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-2">
                                            <FileQuestion className="h-5 w-5 text-primary" />
                                            <h3 className="font-medium">Тест</h3>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Label htmlFor={`passing-score-${lesson.id}`} className="text-xs">
                                              Проходной балл (%):
                                            </Label>
                                            <Input
                                              id={`passing-score-${lesson.id}`}
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={lesson.quiz.passingScore}
                                              onChange={(e) => handleUpdatePassingScore(
                                                module.id, 
                                                lesson.id, 
                                                Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                                              )}
                                              className="w-16 h-7 text-xs"
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                          {lesson.quiz.questions && lesson.quiz.questions.map((question, index) => (
                                            <div key={question.id} className="border rounded-md p-3 space-y-3">
                                              <div className="flex justify-between items-start">
                                                <div className="space-y-2 flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                                                      {index + 1}
                                                    </div>
                                                    <Input
                                                      value={question.text}
                                                      onChange={(e) => handleUpdateQuestion(
                                                        module.id, 
                                                        lesson.id, 
                                                        question.id, 
                                                        { text: e.target.value }
                                                      )}
                                                      placeholder="Введите вопрос"
                                                      className="flex-1"
                                                    />
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2 pl-8">
                                                    <Label htmlFor={`question-type-${question.id}`} className="text-xs whitespace-nowrap">
                                                      Тип вопроса:
                                                    </Label>
                                                    <Select
                                                      id={`question-type-${question.id}`}
                                                      value={question.type}
                                                      onChange={(e) => handleUpdateQuestion(
                                                        module.id, 
                                                        lesson.id, 
                                                        question.id, 
                                                        { type: e.target.value as 'single' | 'multiple' | 'text' }
                                                      )}
                                                      className="w-32 h-7 text-xs"
                                                    >
                                                      <SelectItem value="single">Один ответ</SelectItem>
                                                      <SelectItem value="multiple">Несколько ответов</SelectItem>
                                                      <SelectItem value="text">Текстовый ответ</SelectItem>
                                                    </Select>
                                                  </div>
                                                </div>
                                                
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleDeleteQuestion(module.id, lesson.id, question.id)}
                                                  className="h-7 w-7 text-destructive"
                                                >
                                                  <Trash className="h-3 w-3" />
                                                </Button>
                                              </div>
                                              
                                              {question.type === 'text' ? (
                                                <div className="pl-8 space-y-2">
                                                  <Label htmlFor={`correct-answer-${question.id}`} className="text-xs">
                                                    Правильный ответ:
                                                  </Label>
                                                  <Input
                                                    id={`correct-answer-${question.id}`}
                                                    value={question.correctAnswer || ''}
                                                    onChange={(e) => handleUpdateQuestion(
                                                      module.id, 
                                                      lesson.id, 
                                                      question.id, 
                                                      { correctAnswer: e.target.value }
                                                    )}
                                                    placeholder="Введите правильный ответ"
                                                  />
                                                </div>
                                              ) : (
                                                <div className="pl-8 space-y-2">
                                                  <Label className="text-xs">Варианты ответов:</Label>
                                                  {question.options?.map((option) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleUpdateOption(
                                                          module.id, 
                                                          lesson.id, 
                                                          question.id, 
                                                          option.id, 
                                                          { isCorrect: !option.isCorrect }
                                                        )}
                                                        className="h-6 w-6 p-0"
                                                      >
                                                        {option.isCorrect ? (
                                                          <CheckCircle className="h-5 w-5 text-primary" />
                                                        ) : (
                                                          <Circle className="h-5 w-5" />
                                                        )}
                                                      </Button>
                                                      <Input
                                                        value={option.text}
                                                        onChange={(e) => handleUpdateOption(
                                                          module.id, 
                                                          lesson.id, 
                                                          question.id, 
                                                          option.id, 
                                                          { text: e.target.value }
                                                        )}
                                                        placeholder="Вариант ответа"
                                                        className="flex-1"
                                                      />
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                          
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddQuestion(module.id, lesson.id)}
                                            className="flex items-center gap-1 mt-2"
                                          >
                                            <PlusCircle className="h-3 w-3" />
                                            Добавить вопрос
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingLessonId(null)}
                                    >
                                      Готово
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs">
                                      {lesson.order}
                                    </div>
                                    <span className="font-medium">{lesson.title}</span>
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground">
                                        {lesson.duration} мин
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveLesson(module.id, lesson.id, 'up')}
                                      disabled={lesson.order <= 1}
                                      className="h-7 w-7"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveLesson(module.id, lesson.id, 'down')}
                                      disabled={lesson.order >= module.lessons.length}
                                      className="h-7 w-7"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingLessonId(lesson.id)}
                                      className="h-7 w-7"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                      className="h-7 w-7 text-destructive"
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
} 