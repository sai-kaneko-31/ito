import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ito</h1>
          <p className="text-gray-600">数字を表現して並び替えるゲーム</p>
        </div>

        <div className="space-y-4">
          <Link
            to="/create"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 block text-center"
          >
            ゲームを作る
          </Link>
          
          <Link
            to="/join"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 block text-center"
          >
            ゲームに参加
          </Link>
        </div>

        <div className="mt-8 text-center">
          <details className="text-left">
            <summary className="text-blue-500 cursor-pointer hover:text-blue-600">
              ゲームのルール
            </summary>
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p>1. お題に合わせて自分の数字を表現します</p>
              <p>2. みんなの表現を聞いて数字の順番を推測します</p>
              <p>3. 正しい順番に並べることができれば成功です</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}