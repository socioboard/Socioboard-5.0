using System;
using System.Threading;
using System.Threading.Tasks;

namespace Domain.Socioboard.Helpers
{
    public class CustomTaskFactory
    {
        public delegate void TaskError(Task task, Exception error);

        private event TaskError Error;

        public static readonly CustomTaskFactory Instance = new CustomTaskFactory();

        private CustomTaskFactory()
        {
            Error += (t, e) =>  { };
        }
      
        private void InvokeError(Task task, Exception error) 
            => Error?.Invoke(task, error);

        public Task Start(Action action)
        {
            var task = new Task(action);
            Start(task);
            return task;
        }

        public Task Start(Action action, CancellationToken token, TaskCreationOptions options = TaskCreationOptions.LongRunning)
        {
            var task = new Task(action, token, options);
            Start(task);
            return task;
        }

        private void Start(Task task)
        {
            task.ContinueWith(t =>
                {
                    if (t.Exception != null)
                        InvokeError(t, t.Exception.InnerException);
                },
                TaskContinuationOptions.OnlyOnFaulted |
                TaskContinuationOptions.ExecuteSynchronously);
            task.Start();
        }

        public Task<T> Start<T>(Func<T> action, TaskCreationOptions options)
        {

            var task = new Task<T>(action, options);

            task.ContinueWith(t =>
                {
                    if (t.Exception != null)
                        InvokeError(t, t.Exception.InnerException);
                },
                TaskContinuationOptions.OnlyOnFaulted |
                TaskContinuationOptions.ExecuteSynchronously);

            task.Start();

            return task;
        }
    }


}