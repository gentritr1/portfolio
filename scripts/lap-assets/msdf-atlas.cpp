// Dev-only bridge to the official msdfgen core. See README.md for the pinned build.
#include "msdfgen.h"
#include <algorithm>
#include <fstream>
#include <iostream>
int main(int argc, char **argv) {
    if (argc != 3) return 1;
    std::ifstream input(argv[1]);
    std::ofstream output(argv[2], std::ios::binary);
    int shapes, width, height; input >> shapes >> width >> height;
    for (int row = 0; row < shapes; ++row) {
        msdfgen::Shape shape;
        int count; input >> count;
        for (int c = 0; c < count; ++c) {
            auto &contour = shape.addContour();
            int points; input >> points;
            std::vector<msdfgen::Point2> path;
            for (int p = 0; p < points; ++p) {
                double x, y; input >> x >> y; path.emplace_back(x, y);
            }
            for (int p = 0; p < points; ++p)
                contour.addEdge(msdfgen::EdgeHolder(path[p], path[(p+1)%points]));
        }
        shape.normalize();
        shape.orientContours();
        msdfgen::edgeColoringSimple(shape, 3.0, 0);
        msdfgen::Bitmap<float, 3> bitmap(width, height);
        msdfgen::generateMSDF(bitmap, shape, msdfgen::Projection(msdfgen::Vector2(1), msdfgen::Vector2(0)), msdfgen::Range(6));
        // PNG rows are top-down; the outline coordinate system is bottom-up.
        for (int y = height-1; y >= 0; --y) for (int x = 0; x < width; ++x) for (int channel = 0; channel < 3; ++channel) {
            unsigned char value = static_cast<unsigned char>(std::clamp(bitmap(x,y)[channel]*255.f, 0.f, 255.f));
            output.write(reinterpret_cast<char *>(&value), 1);
        }
    }
}
