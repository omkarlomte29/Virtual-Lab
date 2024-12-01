import os

def aggregate_file_contents(output_file='aggregated_contents.txt'):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file != output_file:  # Avoid processing the output file itself
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path)
                    
                    outfile.write(f"{relative_path}:\n")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            outfile.write(content)
                    except Exception as e:
                        outfile.write(f"Error reading file: {str(e)}\n")
                    
                    outfile.write("\n\n")

if __name__ == "__main__":
    aggregate_file_contents()
    print("File contents have been aggregated into 'aggregated_contents.txt'")