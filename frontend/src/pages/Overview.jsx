import { HomeIcon, UsersIcon, KeyIcon, ChartBarIcon, ArrowPathIcon as RefreshIcon } from '@heroicons/react/24/outline';

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {/* Lägenheter */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center">
      <div className="p-2 bg-blue-500 rounded-lg">
        <HomeIcon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Lägenheter</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">136</p>
      </div>
    </div>
  </div>

  {/* Hyresregister */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center">
      <div className="p-2 bg-green-500 rounded-lg">
        <UsersIcon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Hyresregister</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">136</p>
      </div>
    </div>
  </div>

  {/* Nycklar */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center">
      <div className="p-2 bg-yellow-500 rounded-lg">
        <KeyIcon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Nycklar</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
      </div>
    </div>
  </div>

  {/* Lediga lgh */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center">
      <div className="p-2 bg-purple-500 rounded-lg">
        <ChartBarIcon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-200">Lediga lgh</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
      </div>
    </div>
  </div>
</div>

{/* Intresseanmälningar */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Intresseanmälningar</h2>
        <RefreshIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
      </div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Ny</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Ingen</span>
        </div>
      </div>
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Denna vecka</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Ingen</span>
        </div>
      </div>
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Avslutade</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Ingen</span>
        </div>
      </div>
    </div>
  </div>

  {/* Felanmälningar */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Felanmälningar</h2>
        <RefreshIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
      </div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Väntande</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
        </div>
      </div>
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Pågående</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
        </div>
      </div>
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Slutförd</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Ingen</span>
        </div>
      </div>
    </div>
  </div>
</div> 