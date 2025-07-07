import { GoogleGenerativeAI } from '@google/generative-ai';
import { Buffer } from 'buffer';

let genAI: GoogleGenerativeAI | null = null;

// クライアントを取得する関数を用意する
const getGenAIClient = () => {
  if (!genAI) {
    // この関数が初めて呼ばれた時に、環境変数が読み込まれた状態で初期化される
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * 旅行プラン生成のためのプロンプトを作成
 */
const createTravelPrompt = (travelData: {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}) => {
  const { destination, startDate, endDate, memberCount, budget, interests, travelStyle, description } = travelData;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const nights = days - 1;

  return `
以下の条件に基づいて、詳細な旅行プランを生成してください。

【旅行基本情報】
- 目的地: ${destination}
- 旅行期間: ${startDate} から ${endDate} (${nights}泊${days}日)
- 参加人数: ${memberCount}名
- 予算: ¥${budget.toLocaleString()}
- 興味: ${interests.join(', ')}
- 旅行スタイル: ${travelStyle}
- 追加要望: ${description || '特になし'}

【出力形式】
以下のJSON形式で出力してください：

{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "day": "Day 1",
      "items": [
        {
          "time": "HH:MM",
          "title": "アクティビティ名",
          "location": "場所名",
          "description": "詳細説明",
          "category": "transport|sightseeing|food|accommodation|activity"
        }
      ]
    }
  ],
  "places": [
    {
      "name": "スポット名",
      "category": "カテゴリ",
      "rating": 4.5,
      "description": "説明"
    }
  ],
  "budget": {
    "transportation": 予算,
    "accommodation": 予算,
    "food": 予算,
    "activities": 予算
  },
  "recommendations": {
    "mustVisit": ["必見スポット1", "必見スポット2"],
    "localFood": ["地元グルメ1", "地元グルメ2"],
    "tips": ["旅行のコツ1", "旅行のコツ2"]
  }
}

【注意事項】
- 予算内で現実的なプランを作成してください
- 参加人数に応じた適切なアクティビティを提案してください
- 興味に基づいたスポットを選定してください
- 旅行スタイルに合わせたスケジュールにしてください
- 交通手段や移動時間も考慮してください
- 日本語で出力してください
`;
};

/**
 * Gemini APIを使用して旅行プランを生成
 */
export const generateTravelPlan = async (travelData: {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}) => {
  try {
    const model = getGenAIClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = createTravelPrompt(travelData);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONを抽出（```json で囲まれている場合がある）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    const plan = JSON.parse(jsonString);
    
    return {
      success: true,
      data: plan
    };
  } catch (error) {
    console.error('AIプラン生成エラー:', error);
    
    // フォールバック：モックデータを返す
    return {
      success: false,
      data: generateMockPlan(travelData),
      error: error instanceof Error ? error.message : 'AIプラン生成に失敗しました'
    };
  }
};

/**
 * モックプランを生成（フォールバック用）
 */
const generateMockPlan = (travelData: {
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  budget: number;
  interests: string[];
  travelStyle: string;
  description: string;
}) => {
  const { destination, startDate, endDate, budget, interests } = travelData;
  
  return {
    schedule: [
      {
        date: startDate,
        day: 'Day 1',
        items: [
          {
            time: '09:00',
            title: `${destination}到着`,
            location: destination,
            description: '空港・駅から目的地への移動',
            category: 'transport'
          },
          {
            time: '14:00',
            title: 'おすすめ観光スポット',
            location: `${destination}の名所`,
            description: `${interests.join('、')}に基づいたおすすめスポット`,
            category: 'sightseeing'
          }
        ]
      }
    ],
    places: [
      {
        name: `${destination}の人気スポット`,
        category: '観光地',
        rating: 4.5,
        description: 'AIが選んだおすすめの場所'
      }
    ],
    budget: {
      transportation: Math.round(budget * 0.3),
      accommodation: Math.round(budget * 0.4),
      food: Math.round(budget * 0.2),
      activities: Math.round(budget * 0.1)
    },
    recommendations: {
      mustVisit: [`${destination}の必見スポット`],
      localFood: [`${destination}の名物グルメ`],
      tips: ['現地の天気をチェックしましょう', '公共交通機関の時刻表を確認しましょう']
    }
  };
};

/**
 * 観光地推薦プロンプトを作成
 */
const createRecommendationPrompt = (prefs: {
  destination: string;
  region?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
}) => {
  const regionText = prefs.region ? `および『${prefs.region}』` : '';
  const regionExample = prefs.region ? `例：目的地がラスベガス、領域がネバダ州ならラスベガス市内やネバダ州内のみ。` : '';
  return `
以下の条件に基づいて、旅行者におすすめの観光地・体験・グルメスポットを**必ず20件**リストアップしてください。

【重要】
- 必ず『${prefs.destination}』${regionText}に関係あるものだけを出力してください。
- ${regionExample}
- 他県・他国・遠方のスポット、全国的な有名スポットは含めないでください。
- スポット名や説明文に必ず目的地名（${prefs.destination}）${prefs.region ? `または領域名（${prefs.region}）` : ''}を含めてください。
- imageフィールドは必ず空文字 '' にしてください。画像URLは不要です。

【旅行条件】
- 目的地: ${prefs.destination}
${prefs.region ? `- 領域: ${prefs.region}` : ''}
- 興味: ${prefs.interests.join(', ')}
- 予算レベル: ${prefs.budget}
- 旅行スタイル: ${prefs.travelStyle}
- グループ人数: ${prefs.groupSize}
- 日数: ${prefs.duration}
- こだわり・要望: ${prefs.customNote || '特になし'}

【出力形式】
以下のJSON配列形式で**20件**出力してください：
[
  {
    "name": "スポット名",
    "category": "カテゴリ",
    "rating": 4.5,
    "image": "",
    "description": "説明",
    "aiReason": "このスポットを選んだ理由",
    "matchScore": 90,
    "estimatedTime": "2時間",
    "priceRange": "¥1000-¥2000",
    "tags": ["タグ1", "タグ2"],
    "isBookmarked": false
  },
  // ...（同様の形式で20件分）
]

【注意事項】
- 旅行条件に合うものを厳選してください
- 日本語で出力してください
- 必ずJSON配列のみを返してください。説明や補足は一切不要です。
`;
};

/**
 * Gemini APIで観光地推薦を生成
 */
export const generateRecommendations = async (prefs: {
  destination: string;
  region?: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  groupSize: number;
  duration: number;
  customNote?: string;
}) => {
  try {
    console.log('バックエンドAI推薦リクエスト destination:', prefs.destination);
    const model = getGenAIClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = createRecommendationPrompt(prefs);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // JSON配列を抽出
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[.*\]/s);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    let recommendations;
    try {
      recommendations = JSON.parse(jsonString);
      if (!Array.isArray(recommendations)) {
        throw new Error('AIレスポンスが配列形式ではありません');
      }
    } catch (e) {
      throw new Error('AIから有効な推薦リストが取得できませんでした。目的地や条件を見直してください。');
    }
    // 目的地名またはregionがname/descriptionに含まれないものを除外
    const dest = prefs.destination.replace(/\s/g, '');
    const region = (prefs.region || '').replace(/\s/g, '');
    const isValidImage = (url: string) => {
      return typeof url === 'string' &&
        url.startsWith('https://') &&
        /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(url) &&
        url.length >= 15 && url.length <= 300;
    };
    const filtered = recommendations.filter((rec: any) => {
      const name = (rec.name || '').replace(/\s/g, '');
      const desc = (rec.description || '').replace(/\s/g, '');
      return (name.includes(dest) || desc.includes(dest) || (region && (name.includes(region) || desc.includes(region))));
    }).map((rec: any) => {
      return {
        ...rec,
        image: isValidImage(rec.image) ? rec.image : 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&w=600'
      };
    });
    return { success: true, recommendations: filtered };
  } catch (error) {
    console.error('AI推薦生成エラー:', error);
    return {
      success: false,
      recommendations: [],
      error: error instanceof Error ? error.message : 'AI推薦生成に失敗しました'
    };
  }
};

/**
 * Gemini Vision APIで画像から人名リストを抽出
 */
export const extractNamesFromImage = async (imageBase64: string) => {
  try {
    const model = getGenAIClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `この画像は名簿やリストです。画像内の「人名」だけを日本語で配列で抽出してください。姓と名が分かる場合はフルネームで。JSON配列で返してください。`;
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/png',
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();
    const match = text.match(/\[.*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }
    return text.split(/\r?\n/).filter(Boolean);
  } catch (error) {
    console.error('画像から人名抽出エラー:', error);
    return [];
  }
}; 