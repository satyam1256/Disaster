const supabase = require('../config/supabase');

exports.getCache = async (key) => {
  const { data, error } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data.value;
};

exports.setCache = async (key, value, ttlSeconds) => {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await supabase
    .from('cache')
    .upsert({ key, value, expires_at: expiresAt });
};

exports.deleteCache = async (key) => {
  try {
    await supabase
      .from('cache')
      .delete()
      .eq('key', key);
  } catch (error) {
    // Log error but don't throw - cache deletion failure shouldn't break the main operation
    console.warn(`Failed to delete cache for key: ${key}`, error.message);
  }
}; 