def merge_sort(arr, key, reverse=False):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid], key, reverse)
    right = merge_sort(arr[mid:], key, reverse)
    return merge(left, right, key, reverse)

def merge(left, right, key, reverse):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        l_val = left[i][key]
        r_val = right[j][key]
        if isinstance(l_val, str) and isinstance(r_val, str):
            l_val = l_val.lower()
            r_val = r_val.lower()
        if (l_val < r_val and not reverse) or (l_val > r_val and reverse):
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result 