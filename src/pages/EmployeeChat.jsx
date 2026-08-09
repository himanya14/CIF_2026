import EmployeeChatComponent from "../components/EmployeeChat/EmployeeChat";

function EmployeeChat({ onOpenBlockScreen, onBack }) {
  return (
    <EmployeeChatComponent
      onOpenBlockScreen={onOpenBlockScreen}
      onBack={onBack}
    />
  );
}

export default EmployeeChat;