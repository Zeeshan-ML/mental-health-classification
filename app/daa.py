import heapq
from collections import Counter

def build_huffman_tree(freq_map):
    # Create a priority queue (min-heap) from frequency map
    heap = [[freq, char] for char, freq in freq_map.items()]
    heapq.heapify(heap)

    # Combine elements until only one tree remains
    while len(heap) > 1:
        freq1, char1 = heapq.heappop(heap)
        freq2, char2 = heapq.heappop(heap)
        combined_freq = freq1 + freq2
        combined_char = (char1, char2)  # Combine characters into a tuple
        heapq.heappush(heap, [combined_freq, combined_char])

    # The final element in the heap is the root of the Huffman Tree
    huffman_tree = heapq.heappop(heap)
    print("Huffman Tree built!")
    return huffman_tree

# Example usage
freq_map = {'a': 5, 'b': 9, 'c': 12, 'd': 13, 'e': 16, 'f': 45}
huffman_tree = build_huffman_tree(freq_map)
print("Huffman Tree:", huffman_tree)