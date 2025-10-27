import { useState } from 'react';

export default function NotificationSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Event', date: '9/17' },
    { id: 2, title: 'New Event', date: '9/17' },
    { id: 3, title: 'New Event', date: '9/17' }
  ]);

  const [tasks] = useState([
    { id: 1, text: 'CWTS - Instructional Activity', checked: false },
    { id: 2, text: 'Compile - Year End Report', checked: false },
    { id: 3, text: 'Optics - Proposed Activities', checked: false },
    { id: 4, text: 'CSO - Liquidation Report', checked: false }
  ]);

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="Toggle notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 bg-blue-700 h-screen p-4 sm:p-6 text-white flex flex-col shadow-2xl z-50 overflow-y-auto
        w-full sm:w-96 md:w-80
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white hover:text-red-300 transition-colors"
          aria-label="Close notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Notifications Header */}
        <div className="flex items-center gap-2 mb-6 mt-8 lg:mt-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <h2 className="font-bold text-base sm:text-lg">NOTIFICATIONS</h2>
        </div>

        {/* Notification Items */}
        <div className="space-y-3 mb-6">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              className="bg-blue-800 rounded-lg p-3 flex items-center justify-between hover:bg-blue-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                </div>
                <div>
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-blue-200">{notif.date}</p>
                </div>
              </div>
              <button 
                onClick={() => removeNotification(notif.id)}
                className="text-white hover:text-red-300 transition-colors ml-2 flex-shrink-0"
                aria-label="Remove notification"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button className="bg-yellow-400 text-blue-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors mb-8 self-start text-sm sm:text-base">
          VIEW ALL
        </button>

        {/* To Grade Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg">TO GRADE</h3>
          </div>

          {/* Task Checkboxes */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <label 
                key={task.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-2 border-white bg-transparent checked:bg-white checked:border-white cursor-pointer flex-shrink-0"
                  defaultChecked={task.checked}
                />
                <span className="text-sm leading-tight group-hover:text-blue-200 transition-colors">
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}