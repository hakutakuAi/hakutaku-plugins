// Statistics used by the reports: Wilson intervals, percentiles and a paired t interval.

function wilson(k, n, z = 1.96) {
	if (!n) return { k, n, p: null, lo: null, hi: null }
	const p = k / n
	const denominator = 1 + (z * z) / n
	const centre = (p + (z * z) / (2 * n)) / denominator
	const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator
	return { k, n, p: round(p), lo: round(Math.max(0, centre - half)), hi: round(Math.min(1, centre + half)) }
}

function percentile(values, q) {
	const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
	if (!sorted.length) return null
	const index = (sorted.length - 1) * q
	const low = Math.floor(index)
	const high = Math.ceil(index)
	return round(sorted[low] + (sorted[high] - sorted[low]) * (index - low))
}

const T_975 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086]

function pairedInterval(differences) {
	const n = differences.length
	if (!n) return { n, mean: null, lo: null, hi: null }
	const mean = differences.reduce((sum, value) => sum + value, 0) / n
	if (n < 2) return { n, mean: round(mean), lo: null, hi: null }
	const variance = differences.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1)
	const t = T_975[Math.min(n - 2, T_975.length - 1)]
	const half = t * Math.sqrt(variance / n)
	return { n, mean: round(mean), lo: round(mean - half), hi: round(mean + half) }
}

function round(value, digits = 4) {
	return Math.round(value * 10 ** digits) / 10 ** digits
}

export { wilson, percentile, pairedInterval, round }
