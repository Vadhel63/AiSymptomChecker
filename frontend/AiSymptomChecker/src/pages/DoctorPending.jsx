import { Clock, AlertCircle, Mail, Phone } from "lucide-react";

const DoctorPending = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Clock className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your doctor account is currently under review
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  What happens next?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our admin team is reviewing your application and credentials.
                  This process typically takes 1-2 business days.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                You will receive notification when:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your account is approved and activated</li>
                <li>• Additional information is required</li>
                <li>• Your application status changes</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Need help?
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@aihealthcare.com</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Thank you for your patience. We'll get back to you soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorPending;
