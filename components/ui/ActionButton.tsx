const ActionButton = ({ icon, color, label, onClick }: { 
  icon: string; 
  color: 'green' | 'blue' | 'purple' | 'orange'; 
  label: string; 
  onClick: () => void 
}) => {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600 shadow-green-500/50',
    blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/50',
    purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/50',
    orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/50'
  }

  return (
    <button
      className={`
        w-14 h-14 rounded-full ${colorClasses[color]} 
        text-white font-bold text-xl flex items-center justify-center
        transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl
        backdrop-blur-sm border border-white/20
      `}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  )
}

export default ActionButton 